'use client';
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {streakTex} from '@/lib/textures';
import {windU} from '@/lib/wind';

const rng=(seed:number)=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
/** Blossom clumps sway in the wind: a small world-space offset in the vertex shader, stronger higher up and during gusts. */
const makeSway=(m:THREE.MeshStandardMaterial)=>{
  m.onBeforeCompile=sh=>{
    sh.uniforms.uTime=windU.uTime;sh.uniforms.uGust=windU.uGust;sh.uniforms.uAmp=windU.uAmp;
    sh.vertexShader='uniform float uTime;uniform float uGust;uniform float uAmp;\n'+sh.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      #ifdef USE_INSTANCING
      vec3 ip=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
      float hh=smoothstep(-1.,4.,ip.y);
      float sw=(sin(uTime*.8+ip.x*.35+ip.z*.25)*.1+sin(uTime*1.9+ip.z*.6+ip.x*.2)*.04)*(1.+uGust*2.6)*uAmp*hh;
      mvPosition.xyz+=(viewMatrix*vec4(sw,sin(uTime*1.3+ip.x)*.03*uAmp*hh,sw*.5,0.)).xyz;
      gl_Position=projectionMatrix*mvPosition;
      #endif`);
  };
  m.customProgramCacheKey=()=>'yoake-sway';
};
/** Keep a wider berth near the cards (type plates, lanterns, shelf) so blossoms never collide with them. */
const zone=(z:number)=>(z<6&&z>-13)||(z<-27&&z>-43)||(z<-58&&z>-92);

function build(mobile:boolean){
  const R=rng(7),rnd=(a:number,b:number)=>a+R()*(b-a),root=new THREE.Group();
  const bark=new THREE.MeshStandardMaterial({color:0xffffff,map:streakTex('#33202e','#12080f'),roughness:1});
  const bent=(rt:number,rb:number,h:number,bend:number,lean:number)=>{const g=new THREE.CylinderGeometry(rt,rb,h,7,8),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i)/h+.5;p.setX(i,p.getX(i)+Math.sin(y*3.1)*bend+y*y*lean);p.setZ(i,p.getZ(i)+Math.sin(y*2.3)*bend*.5)}
    g.computeVertexNormals();return g};
  const blobs:{m:THREE.Matrix4;c:THREE.Color}[]=[],per=mobile?70:140,dummy=new THREE.Object3D();
  const ca=new THREE.Color(0xffd1e0),cb=new THREE.Color(0xf48fb1),cw=new THREE.Color(0xfff0f5);
  const makeTree=(x:number,z:number,sd:number,far:boolean)=>{
    const g=new THREE.Group(),trunk=new THREE.Mesh(bent(.2,.58,4.8,rnd(-.25,.25),-sd*rnd(.1,.5)),bark);trunk.position.y=2.4;g.add(trunk);
    const tips:THREE.Vector3[]=[];
    for(let b=0;b<(mobile?2:3);b++){
      const th=sd*rnd(.6,1.3)*(far?.6:1),by=2.9+b*.75,len=rnd(2.4,3.6),bz=rnd(-.8,.8);
      const br=new THREE.Mesh(bent(.07,.2,len,.15,.2),bark);br.rotation.z=th;br.position.set(-Math.sin(th)*len/2,by+Math.cos(th)*len/2,bz);g.add(br);
      tips.push(new THREE.Vector3(-Math.sin(th)*len,by+Math.cos(th)*len,bz));
    }
    tips.push(new THREE.Vector3(-sd*.5,5.6,0));
    g.position.set(x,-2,z);g.rotation.y=rnd(-.3,.3);root.add(g);g.updateMatrixWorld(true);
    for(let i=0;i<per;i++){
      const tp=tips[i%tips.length],sc=rnd(.4,.85);
      dummy.position.set(tp.x+rnd(-1.7,1.7),tp.y+rnd(-.6,1.2),tp.z+rnd(-1.7,1.7));dummy.scale.set(sc*1.2,sc*.85,sc*1.2);dummy.rotation.set(rnd(0,6),rnd(0,6),0);dummy.updateMatrix();
      blobs.push({m:dummy.matrix.clone().premultiply(g.matrixWorld),c:R()<.18?cw.clone():ca.clone().lerp(cb,R())});
    }
  };
  [-1,1].forEach(sd=>{for(let z=4;z>-105;z-=(7+R()*3)*(mobile?1.6:1)){const far=zone(z);makeTree(sd*(far?rnd(17,21):rnd(9.5,14.5)),z,sd,far)}});
  const bm=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x3a1426,emissiveIntensity:.35,flatShading:true,roughness:.9});makeSway(bm);
  const inst=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),bm,blobs.length);
  blobs.forEach((b,i)=>{inst.setMatrixAt(i,b.m);inst.setColorAt(i,b.c)});
  inst.instanceMatrix.needsUpdate=true;if(inst.instanceColor)inst.instanceColor.needsUpdate=true;inst.frustumCulled=false;root.add(inst);
  return root;
}

export default function Trees({mobile}:{mobile:boolean}){
  const root=useMemo(()=>build(mobile),[mobile]),mirror=useMemo(()=>build(mobile),[mobile]);
  useEffect(()=>()=>[root,mirror].forEach(r=>r.traverse((o:any)=>{o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose()}})),[root,mirror]);
  /* the mirrored copy (same seed, so identical trees) is the reflection seen through the ponds */
  return(<><primitive object={root}/><group position={[0,-4,0]} scale={[1,-1,1]}><primitive object={mirror}/></group></>);
}