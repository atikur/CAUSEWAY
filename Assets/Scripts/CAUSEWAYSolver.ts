// Native adapter of src/core/solver.ts. Engineering values remain SI.
import { validate, UnstableStructure } from './CAUSEWAYModel';
import type { Structure, Load, V3, Solution } from './CAUSEWAYModel';

/** Small-displacement, pin-jointed linear elastic 3D truss. No bending or post-failure dynamics. */
export function solve(model: Structure, loads: Load[]): Solution {
  validate(model, loads);
  const n = model.joints.length * 3, index = new Map(model.joints.map((j, i) => [j.id, i]));
  const K = Array.from({length:n}, () => Array(n).fill(0)), f = Array(n).fill(0);
  const geometry = model.members.map(m => {
    const ia = index.get(m.a)!, ib = index.get(m.b)!;
    const a = model.joints[ia].position, b = model.joints[ib].position;
    const d = b.map((x,i) => x-a[i]), L = Math.hypot(...d), c = d.map(x => x/L);
    const q = [...c.map(x => -x), ...c], dofs = [ia*3,ia*3+1,ia*3+2,ib*3,ib*3+1,ib*3+2];
    for (let i=0;i<6;i++) for(let j=0;j<6;j++) K[dofs[i]][dofs[j]] += m.young*m.area/L*q[i]*q[j];
    return {L,q,dofs};
  });
  for(const load of loads) load.force.forEach((x,i) => f[index.get(load.joint)!*3+i] += x);
  const free:number[] = [];
  model.joints.forEach((j,i) => j.fixed.forEach((fixed,k) => {if(!fixed) free.push(i*3+k);}));
  const A = free.map(i => free.map(j => K[i][j])), rhs = free.map(i => f[i]);
  // Symmetric diagonal scaling keeps the pivot test meaningful across section sizes.
  const scales = A.map((r,i) => Math.sqrt(r[i]));
  if(scales.some(s => !Number.isFinite(s) || s <= 0)) throw new UnstableStructure('Unrestrained joint motion.');
  const M = A.map((r,i) => [...r.map((x,j) => x/scales[i]/scales[j]), rhs[i]/scales[i]]);
  for(let k=0;k<free.length;k++) {
    let pivot=k;
    for(let i=k+1;i<free.length;i++) if(Math.abs(M[i][k])>Math.abs(M[pivot][k])) pivot=i;
    if(Math.abs(M[pivot][k])<1e-11) throw new UnstableStructure('Structure is unstable or too ill-conditioned.');
    [M[k],M[pivot]]=[M[pivot],M[k]];
    for(let i=k+1;i<free.length;i++) {
      const ratio=M[i][k]/M[k][k]; M[i][k]=0;
      for(let j=k+1;j<=free.length;j++) M[i][j]-=ratio*M[k][j];
    }
  }
  const x=Array(free.length).fill(0), u=Array(n).fill(0);
  for(let i=free.length-1;i>=0;i--) {
    let v=M[i][free.length]; for(let j=i+1;j<free.length;j++) v-=M[i][j]*x[j];
    x[i]=v/M[i][i];
  }
  free.forEach((d,i) => u[d]=x[i]/scales[i]);
  const residual=K.map((r,i) => r.reduce((s,v,j) => s+v*u[j],0)-f[i]);
  const displacement: Record<string,V3>={}, reactions:Record<string,V3>={};
  model.joints.forEach((j,i) => {
    displacement[j.id]=u.slice(i*3,i*3+3) as V3;
    reactions[j.id]=j.fixed.map((fixed,k) => fixed?residual[i*3+k]:0) as V3;
  });
  const members=model.members.map((m,i) => {
    const g=geometry[i], extension=g.dofs.reduce((s,d,k) => s+u[d]*g.q[k],0);
    const force=m.young*m.area/g.L*extension, stress=force/m.area;
    return {id:m.id,force,stress,utilization:Math.abs(stress)/(stress>=0?m.tensileLimit:m.compressiveLimit)};
  });
  return {displacement,reactions,members,residual:free.reduce((s,d) => Math.max(s,Math.abs(residual[d])),0),
    maxUtilization:members.reduce((s,m) => Math.max(s,m.utilization),0)};
}
