'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {beamTex,ridgeTex} from '@/lib/textures';

/** Misty mountain ridges behind the gates; the moon rises from behind the farthest one. Unfogged on purpose
    (colours are pre-hazed, since scene fog would turn them into one flat colour at this distance). */
const LAYERS=[
  {z:-122,h:50,rgb:[150,110,170],amp:.5,seed:11,o:-3},
  {z:-114,h:40,rgb:[100,76,146],amp:.6,seed:23,o:-2},
  {z:-106,h:30,rgb:[58,46,108],amp:.5,seed:37,o:-1},
];
export function Mountains(){
  const tex=useMemo(()=>LAYERS.map(l=>ridgeTex(l.rgb,l.seed,l.amp)),[]);
  useEffect(()=>()=>tex.forEach(t=>t.dispose()),[tex]);
  return(<>{LAYERS.map((l,i)=>
    <mesh key={i} position={[0,-6+l.h/2,l.z]} renderOrder={l.o} raycast={()=>null}>
      <planeGeometry args={[460,l.h]}/><meshBasicMaterial map={tex[i]} transparent depthWrite={false} fog={false}/>
    </mesh>)}</>);
}

/** A distant five-tier pagoda silhouette with lit windows. */
export function Pagoda(){
  const a=useMemo(()=>({body:new THREE.MeshBasicMaterial({color:0x241a4a,fog:false}),roof:new THREE.MeshBasicMaterial({color:0x170f35,fog:false}),win:new THREE.MeshBasicMaterial({color:0xffc27a,fog:false})}),[]);
  return(<group position={[-27,-2,-98]} scale={2.4}>
    {[0,1,2,3,4].map(i=>{const w=4.6-i*.65;return(
      <group key={i} position={[0,i*2.5,0]}>
        <mesh material={a.body} position={[0,.8,0]}><boxGeometry args={[w,1.6,w]}/></mesh>
        <mesh material={a.win} position={[0,.85,w/2+.02]}><planeGeometry args={[w*.4,.6]}/></mesh>
        <mesh material={a.roof} position={[0,1.85,0]} rotation-y={Math.PI/4}><coneGeometry args={[w*1.1,.95,4]}/></mesh>
      </group>)})}
    <mesh material={a.roof} position={[0,13,0]}><cylinderGeometry args={[.05,.08,2.2,6]}/></mesh>
  </group>);
}

/** Soft moonlight shafts slanting through the path. Additive and very faint, drifting slowly. */
const BEAMS=[[-5,.3],[3,-.25],[-2,.18],[6,-.32],[-6,.22],[1,-.15],[4,.28]];
export function Beams(){
  const tex=useMemo(()=>beamTex(),[]),g=useRef<THREE.Group>(null!);
  useEffect(()=>()=>tex.dispose(),[tex]);
  useFrame(s=>{const t=s.clock.elapsedTime;g.current.children.forEach((c:any,i)=>{c.material.opacity=.07+.04*Math.sin(t*.35+i*1.7)})});
  return(<group ref={g}>{BEAMS.map(([x,r],i)=>
    <mesh key={i} position={[x,14,-28-i*10]} rotation-z={r} scale={[7,38,1]} raycast={()=>null}>
      <planeGeometry args={[1,1]}/><meshBasicMaterial map={tex} color={0xffd0e0} transparent opacity={.08} blending={THREE.AdditiveBlending} depthWrite={false} fog={false}/>
    </mesh>)}</group>);
}