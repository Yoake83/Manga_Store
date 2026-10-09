'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {paintedCard} from '@/lib/cardArt';
import {prefersReduced} from '@/lib/rig';
import * as THREE from 'three';
import {TYPES,GENRES} from '@/lib/taxonomy';
import {card,glowTex,lanternTex,plaque,titleTex} from '@/lib/textures';
import type {RigRef} from '@/lib/rig';
import type {Series} from '@/lib/types';

type Kind='card'|'lantern'|'cover';
type Audio={hover:()=>void;choose:()=>void}|null;
const tint=true;

/** One selectable object: reveal animation, hover lift/brighten, idle motion and pointer events. */
function Hoverable({rig,st,i,pos,rot=[0,0,0],kind,audio,onClick,children}:{
  rig:RigRef;st:number;i:number;pos:[number,number,number];rot?:[number,number,number];kind:Kind;audio:Audio;onClick:()=>void;children:ReactNode}){
  const g=useRef<THREE.Group>(null!),h=useRef(0),hov=useRef(false),mats=useRef<any[]>([]),mount=useRef(performance.now());
  useEffect(()=>{mats.current=[];g.current.traverse((o:any)=>{const m=o.material;if(m&&m.userData?.tint&&!mats.current.includes(m))mats.current.push(m)})},[]);
  const pointer=useRef({x:0,y:0}),foil=useRef<THREE.ShaderMaterial>(null!),floor=useRef<THREE.MeshBasicMaterial>(null!);
  const reduce=useMemo(()=>prefersReduced(),[]),glow=useMemo(()=>glowTex(),[]);
  useEffect(()=>()=>{glow.dispose();document.body.style.cursor=''},[glow]);
  const uniforms=useMemo(()=>({time:{value:0},hover:{value:0}}),[]);
  const width=kind==='cover'?2.7:2.4,height=kind==='cover'?3.7:3.6;
  const ok=()=>!rig.current.busy&&!rig.current.paused&&rig.current.stage===st;
  useFrame((state,dt)=>{
    const r=rig.current,now=performance.now(),t=state.clock.elapsedTime,o=g.current;
    if(r.stage!==st)hov.current=false;
    h.current+=((hov.current?1:0)-h.current)*(1-Math.exp(-10*dt));
    if(foil.current){foil.current.uniforms.time.value=t;foil.current.uniforms.hover.value=h.current}
    if(floor.current)floor.current.opacity=(r.stage===st?.11+h.current*.16:0);
    const born=(st===3?mount.current:r.born[st])+i*(st===3?60:110),k=Math.max(0,Math.min(1,(now-born)/800)),be=1-Math.pow(1-k,3);
    o.scale.setScalar(Math.max(.001,be)*(1+h.current*.14));
    if(kind==='card'){o.position.y=pos[1]+Math.sin(t*.9+i)*.2;o.lookAt(state.camera.position.x,o.position.y,state.camera.position.z);if(!reduce){o.rotation.x=-pointer.current.y*h.current*.09;o.rotation.y+=pointer.current.x*h.current*.12}}
    else if(kind==='lantern'){o.position.y=pos[1]+Math.sin(t*1.1+i*1.7)*.25;o.rotation.y=Math.sin(t*.4+i)*.15;o.rotation.z=Math.sin(t*.8+i)*.04}
    else{o.position.z=pos[2]+h.current*.9;o.position.y=pos[1]+Math.sin(t*.7+i)*.12;o.rotation.x=reduce?0:-pointer.current.y*h.current*.07;o.rotation.y=rot[1]+(reduce?0:pointer.current.x*h.current*.09)}
    const b=.85+h.current*.55;mats.current.forEach(m=>m.color.setScalar(b));
  });
  return(<><group ref={g} position={pos} rotation={rot}
    onPointerOver={e=>{if(!ok())return;e.stopPropagation();hov.current=true;audio?.hover();document.body.style.cursor='pointer'}}
    onPointerMove={e=>{if(!ok())return;const q=g.current.worldToLocal(e.point.clone());pointer.current={x:THREE.MathUtils.clamp(q.x/(width/2),-1,1),y:THREE.MathUtils.clamp(q.y/(height/2),-1,1)}}}
    onPointerOut={()=>{hov.current=false;document.body.style.cursor=''}}
    onClick={e=>{if(!ok())return;e.stopPropagation();audio?.choose();onClick()}}>{children}
      {kind!=='lantern'&&<mesh position={[0,0,.035]} raycast={()=>null}>
        <planeGeometry args={[width,height]}/>
        <shaderMaterial ref={foil} uniforms={uniforms} transparent depthWrite={false}
          vertexShader={`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
          fragmentShader={`varying vec2 vUv;uniform float time;uniform float hover;void main(){float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));float border=1.-smoothstep(.012,.025,edge);float sweep=pow(max(0.,1.-abs(vUv.x+vUv.y-fract(time*.38)*2.)/.22),3.);gl_FragColor=vec4(mix(vec3(.93,.7,.45),vec3(1.,.93,.82),sweep),border*(.22+hover*(.28+sweep*.5)));}`}/>
      </mesh>}
    </group>
    {kind!=='lantern'&&<mesh position={[pos[0],.06,pos[2]]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}>
      <planeGeometry args={[4.5,3.6]}/><meshBasicMaterial ref={floor} map={glow} color="#ffb3cc" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false}/>
    </mesh>}
  </>);
}

type Common={rig:RigRef;audio:Audio;onPick:(st:number,i:number)=>void};

export function TypeCards({rig,audio,onPick}:Common){
  const aspect=useThree(s=>s.size.width/s.size.height);
  const [painted,setPainted]=useState<THREE.Texture[]>([]);
  useEffect(()=>{let alive=true;let textures:THREE.Texture[]=[];const image=new Image();image.onload=()=>{if(!alive)return;textures=TYPES.map((d,i)=>paintedCard(image,i,d.n,d.d,d.k));setPainted(textures)};image.src='/art/type-atlas.png';return()=>{alive=false;image.onload=null;textures.forEach(t=>t.dispose())}},[]);
  const tex=useMemo(()=>TYPES.map(d=>card(d.k,d.n,d.d,d.h)),[]);
  useEffect(()=>()=>tex.forEach(t=>t.dispose()),[tex]);
  return(<>{TYPES.map((d,i)=>{const a=(i-2.5)*.38;return(
    <Hoverable key={d.n} rig={rig} st={1} i={i} kind="card" audio={audio} onClick={()=>onPick(1,i)} pos={aspect<1?[(i%3-1)*2.9,i<3?6.2:2.1,-10]:[Math.sin(a)*8.5,2.8,-6-Math.cos(a)*2.2+2.2]}>
      <mesh><planeGeometry args={[2.4,3.6]}/><meshBasicMaterial map={painted[i]??tex[i]} side={THREE.DoubleSide} userData={{tint}}/></mesh>
    </Hoverable>)})}</>);
}

export function Lanterns({rig,audio,onPick}:Common){
  const a=useMemo(()=>({
    glow:glowTex(),lathe:new THREE.LatheGeometry([[.38,.55],[.62,.4],[.7,0],[.62,-.4],[.38,-.55]].map(p=>new THREE.Vector2(p[0],p[1])),28),
    cap:new THREE.CylinderGeometry(.4,.4,.12,16),lac:new THREE.MeshStandardMaterial({color:0x1c0f1a,roughness:.6}),
    gold:new THREE.MeshBasicMaterial({color:0xe9c987}),str:new THREE.MeshBasicMaterial({color:0x2a1738}),
    bodies:GENRES.map(d=>lanternTex(d.k,d.h)),plaques:GENRES.map(d=>plaque(d.n,d.d)),
  }),[]);
  useEffect(()=>()=>{a.glow.dispose();a.bodies.forEach(t=>t.dispose());a.plaques.forEach(t=>t.dispose())},[a]);
  return(<>{GENRES.map((d,i)=>(
    <Hoverable key={d.n} rig={rig} st={2} i={i} kind="lantern" audio={audio} onClick={()=>onPick(2,i)} pos={[(i-3.5)*2.3,2.6+(i%2)*1.7,-34+(i%3)*.8]}>
      <mesh geometry={a.lathe}><meshBasicMaterial map={a.bodies[i]} side={THREE.DoubleSide} userData={{tint}}/></mesh>
      <mesh geometry={a.cap} material={a.lac} position={[0,.6,0]}/><mesh geometry={a.cap} material={a.lac} position={[0,-.6,0]}/>
      <mesh material={a.gold} position={[0,-.85,0]}><cylinderGeometry args={[.025,.025,.5,6]}/></mesh>
      <mesh material={a.gold} position={[0,-1.15,0]}><sphereGeometry args={[.1,10,10]}/></mesh>
      <mesh material={a.str} position={[0,7.6,0]}><boxGeometry args={[.02,14,.02]}/></mesh>
      <sprite scale={[4.6,4.6,1]} raycast={()=>null}>
        <spriteMaterial map={a.glow} blending={THREE.AdditiveBlending} transparent depthWrite={false} color={new THREE.Color().setHSL(d.h/360,1,.72)} opacity={.8}/>
      </sprite>
      <mesh position={[0,-1.95,0]}><planeGeometry args={[2.4,.95]}/><meshBasicMaterial map={a.plaques[i]} transparent depthWrite={false}/></mesh>
    </Hoverable>))}</>);
}

function Cover({it,i,hue,rig,audio,onOpen}:{it:Series;i:number;hue:number;rig:RigRef;audio:Audio;onOpen:(s:Series)=>void}){
  const [real,setReal]=useState<THREE.Texture|null>(null);
  const ph=useMemo(()=>card(it.title.charAt(0).toUpperCase(),it.title,'Series',hue),[it.title,hue]);
  const tl=useMemo(()=>titleTex(it.title),[it.title]);
  useEffect(()=>{
    let dead=false;const ld=new THREE.TextureLoader();ld.setCrossOrigin('anonymous');
    ld.load(it.cover,t=>{if(dead){t.dispose();return}t.anisotropy=4;setReal(t)},undefined,()=>{});
    return()=>{dead=true};
  },[it.cover]);
  useEffect(()=>()=>{ph.dispose();tl.dispose()},[ph,tl]);
  useEffect(()=>()=>{real?.dispose()},[real]);
  const col=i%5,top=i<5,a=(col-2)*.5;
  return(<Hoverable rig={rig} st={3} i={i} kind="cover" audio={audio} onClick={()=>onOpen(it)}
    pos={[Math.sin(a)*11,top?4.9:.6,-72+11*(1-Math.cos(a))-1]} rot={[0,-a*.9,0]}>
    <mesh position={[0,0,-.03]}><planeGeometry args={[2.7,3.7]}/><meshBasicMaterial color={0xffc4d6} side={THREE.DoubleSide}/></mesh>
    <mesh><planeGeometry args={[2.5,3.5]}/><meshBasicMaterial map={real??ph} side={THREE.DoubleSide} userData={{tint}}/></mesh>
    <mesh position={[0,-2.1,0]}><planeGeometry args={[2.6,.5]}/><meshBasicMaterial map={tl} transparent depthWrite={false}/></mesh>
  </Hoverable>);
}

export function Shelf({items,sel,rig,audio,onOpen}:{items:Series[];sel:{type:number|null;genre:number|null};rig:RigRef;audio:Audio;onOpen:(s:Series)=>void}){
  const base=TYPES[sel.type??0].h+(sel.genre??0)*14;
  return(<>{items.slice(0,10).map((it,i)=><Cover key={it.id} it={it} i={i} hue={(base+i*9)%360} rig={rig} audio={audio} onOpen={onOpen}/>)}</>);
}
