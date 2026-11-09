/** Parametric truss primitives in presentation centimeters. No engineering state. */
export function cylinder(builder:MeshBuilder,a:vec3,b:vec3,radius:number,color:vec4,segments=8):void {
  const q=quat.rotationFromTo(new vec3(1,0,0),b.sub(a).normalize());
  const half=b.sub(a).length/2, center=a.add(b).uniformScale(0.5);
  const base=builder.getVerticesCount();
  const vertex=(x:number,y:number,z:number,nx:number,ny:number,nz:number)=>{
    const p=q.multiplyVec3(new vec3(x,y,z)).add(center);
    const n=q.multiplyVec3(new vec3(nx,ny,nz));
    builder.appendVerticesInterleaved([p.x,p.y,p.z,n.x,n.y,n.z,color.x,color.y,color.z,color.w]);
  };
  for(let i=0;i<=segments;i++){
    const t=i/segments*Math.PI*2,c=Math.cos(t),s=Math.sin(t);
    vertex(-half,c*radius,s*radius,0,c,s);vertex(half,c*radius,s*radius,0,c,s);
  }
  for(let i=0;i<segments;i++){
    const bl=base+i*2,br=bl+1,tl=bl+2,tr=bl+3;
    builder.appendIndices([bl,tr,br,bl,tl,tr]);
  }
  for(const side of [-1,1]){
    const start=builder.getVerticesCount();vertex(side*half,0,0,side,0,0);
    for(let i=0;i<=segments;i++){
      const t=i/segments*Math.PI*2;vertex(side*half,Math.cos(t)*radius,Math.sin(t)*radius,side,0,0);
    }
    for(let i=0;i<segments;i++)builder.appendIndices(side<0?[start,start+i+2,start+i+1]:[start,start+i+1,start+i+2]);
  }
}
export function makeBuilder():MeshBuilder {
  const b=new MeshBuilder([{name:'position',components:3},{name:'normal',components:3,normalized:true},{name:'color',components:4}]);
  b.topology=MeshTopology.Triangles;b.indexType=MeshIndexType.UInt16;return b;
}
