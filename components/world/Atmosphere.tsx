'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {mistTex,petalTex} from '@/lib/textures';
import type {RigRef} from '@/lib/rig';
import {gustAt,windU} from '@/lib/wind';

/** Real petal quads that tumble on all three axes, drift on rolling gusts, and stream toward you during gate dives. */
export function Petals({rig,mobile,reduce}:{rig:RigRef;mobile:boolean;reduce:boolean}){
  const N=reduce?250:mobile?450:900,ref=useRef<THREE.InstancedMesh>(null!),tex=useMemo(()=>petalTex(),[]),o=useMemo(()=>new THREE.Object3D(),[]);
  const P=useMemo(()=>{
    const c1=new THREE.Color(0xffe3ec),c2=new THREE.Color(0xff9fbd),r=(a:number,b:number)=>a+Math.random()*(b-a);
    return Array.from({length:N},()=>({x:r(-26,26),y:r(-2,18),z:r(-103,22),vy:r(.5,1.6),rx:r(0,6),ry:r(0,6),rz:r(0,6),wx:r(-3,3),wy:r(-3,3),wz:r(-3,3),s:r(.22,.44),ph:r(0,6),col:c1.clone().lerp(c2,Math.random())}));
  },[N]);
  useEffect(()=>{P.forEach((p,i)=>ref.current.setColorAt(i,p.col));if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true},[P]);
  useEffect(()=>{windU.uAmp.value=reduce?0:1},[reduce]);
  useEffect(()=>()=>tex.dispose(),[tex]);
  useFrame((s,dt)=>{
    const d=Math.min(dt,.05),t=s.clock.elapsedTime,burst=rig.current.burst,gust=gustAt(t),sm=reduce?1:1+burst*3;
    windU.uTime.value=t;windU.uGust.value=gust;
    const wx=.4+gust*2.4,wz=.15+gust*.8,lift=gust*.5,spin=1+gust*1.5;
    for(let i=0;i<N;i++){
      const p=P[i];
      p.y+=(-p.vy*sm*(1-gust*.4)+lift)*d;
      p.x+=(wx+Math.sin(t*.7+p.ph)*.35)*d;
      p.z+=(wz+Math.cos(t*.5+p.ph)*.25+(reduce?0:burst*38))*d;
      p.rx+=p.wx*d*spin;p.ry+=p.wy*d*spin;p.rz+=p.wz*d*spin;
      if(p.y<-2)p.y=18;else if(p.y>20)p.y=-1;
      if(p.x>26)p.x=-26;
      if(p.z>26)p.z=-103;
      o.position.set(p.x,p.y,p.z);o.rotation.set(p.rx,p.ry,p.rz);o.scale.setScalar(p.s);o.updateMatrix();ref.current.setMatrixAt(i,o.matrix);
    }
    ref.current.instanceMatrix.needsUpdate=true;
  });
  return(<instancedMesh ref={ref} args={[undefined as any,undefined as any,N]} frustumCulled={false} raycast={()=>null}>
    <planeGeometry args={[1,1]}/><meshBasicMaterial map={tex} transparent alphaTest={.05} depthWrite={false} side={THREE.DoubleSide}/>
  </instancedMesh>);
}

export function Mist({mobile}:{mobile:boolean}){
  const g=useRef<THREE.Group>(null!);
  const {tex,data}=useMemo(()=>{
    const n=mobile?10:18,r=(a:number,b:number)=>a+Math.random()*(b-a);
    return{tex:mistTex(),data:Array.from({length:n},(_,i)=>({bx:r(-5,5),y:r(-1.4,-.6),z:20-i*(mobile?10:6.5),w:r(12,20),h:r(3,5),ph:r(0,6),o:r(.14,.26)}))};
  },[mobile]);
  useFrame(s=>{const t=s.clock.elapsedTime;g.current.children.forEach((c:any,i)=>{const d=data[i];c.position.x=d.bx+Math.sin(t*.12+d.ph)*2.5;c.material.opacity=d.o*(.8+.2*Math.sin(t*.4+d.ph))})});
  return(<group ref={g}>{data.map((d,i)=>
    <sprite key={i} position={[d.bx,d.y,d.z]} scale={[d.w,d.h,1]} raycast={()=>null}>
      <spriteMaterial map={tex} color={0xffd6e6} transparent opacity={d.o} depthWrite={false}/>
    </sprite>)}</group>);
}