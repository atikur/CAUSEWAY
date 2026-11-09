// Native adapter of src/core/model.ts. Engineering values remain SI.
/** SI units throughout; visual scaling must never change these values. */
export type V3 = [number, number, number];
export interface Joint { id: string; position: V3; fixed: [boolean, boolean, boolean] }
export interface Member {
  id: string; a: string; b: string; area: number; young: number;
  tensileLimit: number; compressiveLimit: number;
}
export interface Structure { id: string; joints: Joint[]; members: Member[] }
export interface Load { joint: string; force: V3 }
export interface MemberResult { id: string; force: number; stress: number; utilization: number }
export interface Solution {
  displacement: Record<string, V3>; reactions: Record<string, V3>;
  members: MemberResult[]; residual: number; maxUtilization: number;
}
export class ModelError extends Error {}
export class UnstableStructure extends ModelError {}
export function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }
export function validate(model: Structure, loads: Load[] = []): void {
  if (!model.joints.length || model.joints.length > 128 || !model.members.length || model.members.length > 512)
    throw new ModelError('Structure must have 1–128 joints and 1–512 members.');
  const ids = new Set<string>(), members = new Set<string>(), pairs = new Set<string>();
  for (const j of model.joints) {
    if (!j.id || ids.has(j.id)) throw new ModelError('Joint IDs must be unique.');
    ids.add(j.id);
    if (j.position.length !== 3 || !j.position.every(Number.isFinite) || j.fixed.length !== 3 || !j.fixed.every(x => typeof x === 'boolean'))
      throw new ModelError('Invalid joint coordinates or restraints.');
  }
  for (const m of model.members) {
    if (!m.id || members.has(m.id) || !ids.has(m.a) || !ids.has(m.b) || m.a === m.b)
      throw new ModelError('Invalid member endpoints or duplicate ID.');
    members.add(m.id);
    const pair = [m.a, m.b].sort().join('|');
    if (pairs.has(pair)) throw new ModelError('Duplicate connection.');
    pairs.add(pair);
    if (![m.area, m.young, m.tensileLimit, m.compressiveLimit].every(x => Number.isFinite(x) && x > 0))
      throw new ModelError('Material and section values must be positive and finite.');
    const a = model.joints.find(j => j.id === m.a)!, b = model.joints.find(j => j.id === m.b)!;
    if (Math.hypot(...a.position.map((x, i) => x - b.position[i])) < 1e-6)
      throw new ModelError('Coincident member endpoints.');
  }
  for (const l of loads) if (!ids.has(l.joint) || l.force.length !== 3 || !l.force.every(Number.isFinite))
    throw new ModelError('Invalid load.');
}
