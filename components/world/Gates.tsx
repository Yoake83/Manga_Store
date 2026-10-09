'use client';
import {useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {glowTex,stoneTex,streakTex} from '@/lib/textures';

const kasagi=()=>{
  const sh=new THREE.Shape(),W=6.4,T=.62,n=24,cv=(x:number)=>Math.pow(Math.abs(x)/W,2.2)*1.05;
  for(let i=0;i<=n;i++){const x=-W+2*W*i/n,y=cv(x)+T+.12;i?sh.lineTo(x,y):sh.moveTo(x,y)}
  for(let i=n;i>=0;i--){const x=-W+2*W*i/n;sh.lineTo(x,cv(x))}
  sh.closePath();
  const g=new THREE.ExtrudeGeometry(sh,{depth:1.2,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:1});g.translate(0,0,-.6);return g;
};

function useAssets(){
  const a=useMemo(()=>{
    const lacq=streakTex('#a8222c','#3a0a10'),st=stoneTex(),glow=glowTex();
    const curve=new THREE.CatmullRomCurve3([[-3,6.4],[-1.5,6],[0,5.85],[1.5,6],[3,6.4]].map(p=>new THREE.Vector3(p[0],p[1],.5)));
    return{
      lacq,st,glow,kGeo:kasagi(),tube:new THREE.TubeGeometry(curve,24,.1,6),
      shide:[0,1,2,3,4].map(i=>{const p=curve.getPoint(.12+i*.19);return [p.x,p.y-.34,p.z] as [number,number,number]}),
      pil:new THREE.CylinderGeometry(.27,.36,9.3,20),base:new THREE.CylinderGeometry(.46,.5,.75,16),
      lacqM:new THREE.MeshStandardMaterial({color:0xffffff,map:lacq,roughness:.42,metalness:.05,emissive:0x1a0408}),
      blk:new THREE.MeshStandardMaterial({color:0x1d1019,roughness:.55,metalness:.1}),
      stone:new THREE.MeshStandardMaterial({map:st,roughness:1}),
      gold:new THREE.MeshStandardMaterial({color:0xe9c987,roughness:.35,metalness:.7,emissive:0x3a2a10}),
      rope:new THREE.MeshStandardMaterial({color:0xd9c08a,roughness:1}),
      paper:new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}),
      fire:new THREE.MeshBasicMaterial({color:0xffd08a}),
    };
  },[]);
  useEffect(()=>()=>{a.lacq.dispose();a.st.dispose();a.glow.dispose();a.kGeo.dispose();a.tube.dispose()},[a]);
  return a;
}
type A=ReturnType<typeof useAssets>;

function Toro({x,z,a}:{x:number;z:number;a:A}){
  return(<group scale={1.4} position={[x,-2,z]}>
    <mesh material={a.stone} position={[0,.125,0]}><boxGeometry args={[.95,.25,.95]}/></mesh>
    <mesh material={a.stone} position={[0,.8,0]}><cylinderGeometry args={[.2,.26,1.1,8]}/></mesh>
    <mesh material={a.stone} position={[0,1.45,0]}><boxGeometry args={[.95,.15,.95]}/></mesh>
    <mesh material={a.fire} position={[0,1.82,0]}><boxGeometry args={[.6,.55,.6]}/></mesh>
    <mesh material={a.stone} position={[0,2.4,0]} rotation-y={Math.PI/4}><coneGeometry args={[.9,.55,4]}/></mesh>
    <mesh material={a.stone} position={[0,2.75,0]}><sphereGeometry args={[.1,8,8]}/></mesh>
    <sprite position={[0,1.82,0]} scale={[3.4,3.4,1]} raycast={()=>null}>
      <spriteMaterial map={a.glow} blending={THREE.AdditiveBlending} transparent depthWrite={false} color={0xffb36b} opacity={.8}/>
    </sprite>
  </group>);
}

function Gate({z,s,toro,a}:{z:number;s:number;toro:boolean;a:A}){
  return(<>
    <group position={[0,-2,z]} scale={s}>
      {[-3,3].map(x=><group key={x}>
        <mesh geometry={a.pil} material={a.lacqM} position={[x,4.65,0]} rotation-z={x<0?-.03:.03}/>
        <mesh geometry={a.base} material={a.blk} position={[x,.38,0]}/>
      </group>)}
      <mesh material={a.lacqM} position={[0,6.75,0]}><boxGeometry args={[7.5,.38,.42]}/></mesh>
      <mesh material={a.lacqM} position={[0,8.95,0]}><boxGeometry args={[9.6,.5,.9]}/></mesh>
      <mesh geometry={a.kGeo} material={a.blk} position={[0,9.2,0]}/>
      <mesh material={a.blk} position={[0,8,0]}><boxGeometry args={[.95,1.5,.32]}/></mesh>
      <mesh material={a.gold} position={[0,8,0]}><boxGeometry args={[.62,1.1,.34]}/></mesh>
      <mesh geometry={a.tube} material={a.rope}/>
      {a.shide.map((p,i)=><mesh key={i} material={a.paper} position={p} rotation-z={i%2?.18:-.18}><planeGeometry args={[.26,.55]}/></mesh>)}
      {[0,1,2,3].map(i=><mesh key={i} material={a.stone} position={[0,.125*(4-i),1.6+i]}><boxGeometry args={[6.6+i*.4,.25*(4-i),1]}/></mesh>)}
    </group>
    {toro&&[-8.2,8.2].map(x=><Toro key={x} x={x} z={z-1} a={a}/>)}
  </>);
}

/** The three torii: type gate, genre gate, and the grand gate behind the shelf. */
export default function Gates(){
  const a=useAssets();
  return(<>
    <Gate z={-10} s={1.2} toro a={a}/><Gate z={-40} s={1.2} toro a={a}/><Gate z={-92} s={1.9} toro={false} a={a}/>
    {/* mirrored copies show through the pond surface as reflections */}
    <group position={[0,-4,0]} scale={[1,-1,1]}><Gate z={-10} s={1.2} toro={false} a={a}/><Gate z={-40} s={1.2} toro={false} a={a}/><Gate z={-92} s={1.9} toro={false} a={a}/></group>
  </>);
}