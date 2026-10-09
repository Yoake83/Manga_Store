'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import type {RigRef} from '@/lib/rig';

/* A swirling pink-gold vortex fills the doorway of a gate as the camera dives through it. */
const vert=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const frag=`uniform float uT;uniform float uA;varying vec2 vUv;
void main(){
  vec2 p=(vUv-.5)*vec2(1.,1.35);float r=length(p),a=atan(p.y,p.x);
  float arms=.5+.5*sin((a+r*7.-uT*1.6)*3.);
  float core=exp(-r*r*10.);
  float ring=smoothstep(.5,.15,r)*(.35+.65*arms);
  vec3 c=mix(vec3(1.,.45,.7),vec3(1.,.9,.8),core);
  float al=(ring*.8+core*1.2)*smoothstep(.55,.35,r)*uA;
  gl_FragColor=vec4(c*al,al);
}`;
const GATES=[-10,-40];

export default function Portals({rig}:{rig:RigRef}){
  const act=useRef(0);
  const mats=useMemo(()=>GATES.map(()=>new THREE.ShaderMaterial({uniforms:{uT:{value:0},uA:{value:0}},vertexShader:vert,fragmentShader:frag,
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})),[]);
  useEffect(()=>()=>mats.forEach(m=>m.dispose()),[mats]);
  useFrame(s=>{
    const r=rig.current,t=s.clock.elapsedTime;
    act.current+=((r.tw?1:0)-act.current)*.12;
    GATES.forEach((gz,i)=>{
      const d=Math.abs(r.cz-gz),sm=(a:number,b:number,x:number)=>{const k=Math.max(0,Math.min(1,(x-a)/(b-a)));return k*k*(3-2*k)};
      /* faint idle shimmer, bright when diving, fading out right at the doorway so the camera never clips the plane */
      const dive=act.current*(1-sm(2.5,14,d))*sm(.3,2.5,d);
      mats[i].uniforms.uT.value=t;mats[i].uniforms.uA.value=.08+dive*.9;
    });
  });
  return(<>{GATES.map((z,i)=>
    <mesh key={z} position={[0,2.8,z]} material={mats[i]} renderOrder={3} raycast={()=>null}><planeGeometry args={[6.8,9.5]}/></mesh>)}</>);
}