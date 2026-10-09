'use client';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {petalTex} from '@/lib/textures';

/* Still pond: fresnel sky tint, ripple normals and a moon glint. The reflections themselves are mirrored
   copies of the gates and trees (see Gates.tsx / Trees.tsx) that show through the semi-transparent surface. */
const vert=`varying vec3 vW;
#include <fog_pars_vertex>
void main(){
  vec4 wp=modelMatrix*vec4(position,1.);vW=wp.xyz;
  vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;
const frag=`uniform float uT;uniform vec3 uDeep;uniform vec3 uSky;uniform vec3 uMoon;varying vec3 vW;
#include <fog_pars_fragment>
void main(){
  vec2 p=vW.xz;
  vec3 n=normalize(vec3(sin(p.x*2.7+uT*.9)*.05+sin(p.y*1.9-uT*.7+p.x)*.045,1.,cos(p.y*2.3+uT*.8)*.05+sin(p.x*3.1-uT*.6)*.04));
  vec3 V=normalize(cameraPosition-vW);
  float f=pow(1.-clamp(dot(n,V),0.,1.),3.);
  vec3 col=mix(uDeep,uSky,f*.75);
  vec3 H=normalize(normalize(uMoon-vW)+V);
  float spec=pow(max(dot(n,H),0.),220.)*1.4;
  col+=vec3(1.,.82,.9)*spec;
  gl_FragColor=vec4(col,clamp(mix(.88,.58,f)+spec,0.,1.));
  #include <fog_fragment>
}`;

function WaterPetals({count}:{count:number}){
  const ref=useRef<THREE.InstancedMesh>(null!),tex=useMemo(()=>petalTex(),[]),o=useMemo(()=>new THREE.Object3D(),[]);
  const data=useMemo(()=>Array.from({length:count},()=>({x:(Math.random()<.5?-1:1)*(3.9+Math.random()*3.3),z:25-Math.random()*150,r:Math.random()*6,s:.28+Math.random()*.22,v:.05+Math.random()*.1})),[count]);
  useEffect(()=>()=>tex.dispose(),[tex]);
  useFrame((s,dt)=>{
    const t=s.clock.elapsedTime;
    data.forEach((p,i)=>{p.z+=p.v*Math.min(dt,.05);if(p.z>25)p.z=-125;
      o.position.set(p.x+Math.sin(t*.3+i)*.15,-1.97,p.z);o.rotation.set(-Math.PI/2,0,p.r+Math.sin(t*.4+i)*.3);o.scale.setScalar(p.s);o.updateMatrix();ref.current.setMatrixAt(i,o.matrix)});
    ref.current.instanceMatrix.needsUpdate=true;
  });
  return(<instancedMesh ref={ref} args={[undefined as any,undefined as any,count]} frustumCulled={false} renderOrder={2} raycast={()=>null}>
    <planeGeometry args={[1,1]}/><meshBasicMaterial map={tex} transparent alphaTest={.05} depthWrite={false} color={0xffc0d4} side={THREE.DoubleSide}/>
  </instancedMesh>);
}

export default function Water({mobile}:{mobile:boolean}){
  const material=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uDeep:{value:new THREE.Color(0x120d2e)},uSky:{value:new THREE.Color(0xd486ad)},uMoon:{value:new THREE.Vector3(6,20,-130)}}]),
    vertexShader:vert,fragmentShader:frag,transparent:true,depthWrite:false,fog:true,
  }),[]);
  useEffect(()=>()=>material.dispose(),[material]);
  useFrame(s=>{material.uniforms.uT.value=s.clock.elapsedTime});
  return(<>
    {[-1,1].map(sd=><mesh key={sd} position={[sd*5.55,-2,-55]} rotation-x={-Math.PI/2} renderOrder={1} raycast={()=>null} material={material}><planeGeometry args={[3.7,160]}/></mesh>)}
    <WaterPetals count={mobile?60:120}/>
  </>);
}