'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {glowTex,pathTex} from '@/lib/textures';

/** Dawn sky, lights, moon and the stone path. */
export default function Backdrop(){
  const scene=useThree(s=>s.scene),halo=useRef<THREE.SpriteMaterial>(null!);
  const {sky,glow,path}=useMemo(()=>{
    const c=document.createElement('canvas');c.width=2;c.height=256;const x=c.getContext('2d')!,g=x.createLinearGradient(0,0,0,256);
    ([[0,'#141a3d'],[.45,'#3d3472'],[.78,'#b56a9a'],[1,'#f4b2c6']] as [number,string][]).forEach(([o,col])=>g.addColorStop(o,col));
    x.fillStyle=g;x.fillRect(0,0,2,256);return{sky:new THREE.CanvasTexture(c),glow:glowTex(),path:pathTex()};
  },[]);
  useEffect(()=>{scene.background=sky;return()=>{scene.background=null}},[scene,sky]);
  useEffect(()=>()=>{sky.dispose();glow.dispose();path.dispose()},[sky,glow,path]);
  useFrame(s=>{if(halo.current)halo.current.opacity=.85+Math.sin(s.clock.elapsedTime*1.4)*.15});
  return(<>
    <ambientLight color={0xffd9e8} intensity={.75}/>
    <directionalLight color={0xffe3ee} intensity={.55} position={[6,14,25]}/>
    <mesh position={[6,20,-130]}><sphereGeometry args={[15,48,48]}/><meshBasicMaterial color={0xfff0f5} fog={false}/></mesh>
    <sprite position={[6,20,-129]} scale={[130,130,1]} raycast={()=>null}>
      <spriteMaterial ref={halo} map={glow} blending={THREE.AdditiveBlending} transparent fog={false} depthWrite={false}/>
    </sprite>
    {/* land is split so the ponds can sit between the path and the banks */}
    <mesh rotation-x={-Math.PI/2} position={[0,-2,-70]}><planeGeometry args={[7.4,280]}/><meshStandardMaterial color={0x1a0f26} roughness={1}/></mesh>
    {[-1,1].map(sd=><mesh key={sd} rotation-x={-Math.PI/2} position={[sd*67.4,-2,-70]}><planeGeometry args={[120,280]}/><meshStandardMaterial color={0x1a0f26} roughness={1}/></mesh>)}
    <mesh rotation-x={-Math.PI/2} position={[0,-20,-70]}><planeGeometry args={[300,300]}/><meshBasicMaterial color={0x120a1e}/></mesh>
    <mesh rotation-x={-Math.PI/2} position={[0,-1.98,-70]}><planeGeometry args={[7,280]}/><meshStandardMaterial map={path} roughness={.9}/></mesh>
  </>);
}