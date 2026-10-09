'use client';
import {useMemo,useRef,useState} from 'react';
import type {RefObject} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Bloom,EffectComposer,DepthOfField,Noise,HueSaturation,BrightnessContrast} from '@react-three/postprocessing';
import {isMobile,prefersReduced} from '@/lib/rig';
import type {RigRef} from '@/lib/rig';
import type {Series} from '@/lib/types';
import CameraRig from './CameraRig';
import Backdrop from './Backdrop';
import Gates from './Gates';
import Trees from './Trees';
import Water from './Water';
import Portals from './Portals';
import {Beams,Mountains,Pagoda} from './SkyDepth';
import {Mist,Petals} from './Atmosphere';
import {Lanterns,Shelf,TypeCards} from './Interactives';

type Props={rig:RigRef;fx:RefObject<HTMLElement>;items:Series[];sel:{type:number|null;genre:number|null};audio:any;
  onPick:(st:number,i:number)=>void;onOpen:(s:Series)=>void;onReady:()=>void};

/** If the first few seconds run slow, drop bloom and clamp the pixel ratio. */
function PerfGuard({onDegrade}:{onDegrade:()=>void}){
  const setDpr=useThree(s=>s.setDpr),ema=useMemo(()=>({v:16,done:false}),[]);
  useFrame((s,dt)=>{
    if(ema.done)return;ema.v+=(Math.min(dt*1000,100)-ema.v)*.05;
    if(s.clock.elapsedTime>4&&ema.v>30){ema.done=true;setDpr(1);onDegrade()}
  });
  return null;
}

/** Only blur the background once the shelf camera settles; mobile keeps the lighter pipeline. */
function Finish({rig,mobile,reduce,bloom}:{rig:RigRef;mobile:boolean;reduce:boolean;bloom:boolean}){
  const [shelf,setShelf]=useState(false),active=useRef(false);
  useFrame(()=>{const next=rig.current.stage===3&&!rig.current.busy&&!rig.current.paused;if(next!==active.current){active.current=next;setShelf(next)}});
  return <EffectComposer enabled={bloom} multisampling={mobile?0:4}>
    <Bloom mipmapBlur intensity={mobile?.45:.6} luminanceThreshold={.88} luminanceSmoothing={.25} radius={.8}/>
    {!mobile&&!reduce&&shelf?<DepthOfField target={[0,2.8,-72]} focalLength={.12} bokehScale={.65} height={360}/>:<></>}
    <HueSaturation hue={-.015} saturation={-.04}/>
    <BrightnessContrast brightness={.015} contrast={.025}/>
    {!mobile&&!reduce?<Noise opacity={.025}/>:<></>}
  </EffectComposer>;
}

export default function Scene({rig,fx,items,sel,audio,onPick,onOpen,onReady}:Props){
  const mobile=useMemo(()=>isMobile(),[]),reduce=useMemo(()=>prefersReduced(),[]);
  const [bloom,setBloom]=useState(true);
  return(
    <Canvas legacy linear flat dpr={[1,mobile?1.5:2]} camera={{fov:60,near:.1,far:300,position:[0,2.3,16]}}
      style={{position:'fixed',inset:0,touchAction:'none'}} onCreated={onReady}>
      <fogExp2 attach="fog" args={[0x6b3f6e,0.013]}/>
      <CameraRig rig={rig} fx={fx} reduce={reduce}/>
      <Backdrop/><Mountains/><Pagoda/><Beams/><Water mobile={mobile}/><Gates/><Portals rig={rig}/><Trees mobile={mobile}/><Petals rig={rig} mobile={mobile} reduce={reduce}/><Mist mobile={mobile}/>
      <TypeCards rig={rig} audio={audio} onPick={onPick}/>
      <Lanterns rig={rig} audio={audio} onPick={onPick}/>
      {items.length>0&&<Shelf items={items} sel={sel} rig={rig} audio={audio} onOpen={onOpen}/>}
      <Finish rig={rig} mobile={mobile} reduce={reduce} bloom={bloom}/>
      <PerfGuard onDegrade={()=>setBloom(false)}/>
    </Canvas>
  );
}
