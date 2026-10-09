'use client';
import {useRef} from 'react';
import type {RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {zFor} from '@/lib/rig';
import type {RigRef} from '@/lib/rig';

/** Camera tween between gates, mouse parallax, FOV punch and the petal-storm flash. */
export default function CameraRig({rig,fx,reduce}:{rig:RigRef;fx:RefObject<HTMLElement>;reduce:boolean}){
  const light=useRef<THREE.PointLight>(null!),a=useRef({sx:0,sy:0,ly:6});
  useFrame(state=>{
    const r=rig.current,cam=state.camera as THREE.PerspectiveCamera,now=performance.now(),t=state.clock.elapsedTime,m=a.current;
    if(r.tw){
      const k=Math.min(1,(now-r.tw.t0)/r.tw.d),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
      r.cz=r.tw.f+(r.tw.t-r.tw.f)*e;r.burst=Math.sin(Math.PI*k);
      if(k>=1){r.tw=null;r.busy=false;r.burst=0}
    }else r.cz=zFor(r.stage,state.size.width/state.size.height);
    if(fx.current)fx.current.style.opacity=String(Math.pow(r.burst,3)*.5);
    m.sx+=(state.pointer.x-m.sx)*.05;m.sy+=(-state.pointer.y-m.sy)*.05;m.ly+=((r.stage===0?6:2.8)-m.ly)*.04;
    const x=m.sx*1.3,y=2.3-m.sy*.5+Math.sin(t*.6)*.1;
    cam.position.set(x,y,r.cz);cam.lookAt(m.sx*2.5,m.ly-m.sy*1.2,r.cz-14);cam.rotateZ(Math.sin(t*.4)*.012+r.burst*.04);
    const fov=60+r.burst*(reduce?4:18);if(Math.abs(fov-cam.fov)>.01){cam.fov=fov;cam.updateProjectionMatrix()}
    light.current.position.set(x,y+3,r.cz-5);
  });
  return <pointLight ref={light} color={0xffb7cc} intensity={1.3} distance={60}/>;
}
