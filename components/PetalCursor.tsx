'use client';
import {useEffect,useRef} from 'react';

/** Bounded canvas pool: no React updates or DOM nodes on pointer movement. */
export default function PetalCursor({disabled}:{disabled:boolean}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current!,x=c.getContext('2d')!;
    const motion=matchMedia('(prefers-reduced-motion: reduce)'),pointer=matchMedia('(pointer: fine)');
    let particles:{x:number;y:number;age:number;r:number;spin:number;vx:number}[]=[],frame=0,last=0,previous=0;
    const resize=()=>{const d=Math.min(devicePixelRatio,1.5);c.width=innerWidth*d;c.height=innerHeight*d;x.setTransform(d,0,0,d,0,0)};
    const draw=(time:number)=>{
      const dt=Math.min((time-previous)/1000,.05);previous=time;x.clearRect(0,0,innerWidth,innerHeight);
      particles=particles.filter(p=>p.age<1);
      for(const p of particles){p.age+=dt;p.x+=p.vx*dt;p.y+=36*dt;p.spin+=dt*2;
        x.save();x.translate(p.x,p.y);x.rotate(p.spin);x.globalAlpha=Math.max(0,(1-p.age)*.65);
        x.fillStyle='#ffc4d9';x.beginPath();x.moveTo(0,p.r);x.bezierCurveTo(-p.r,p.r*.2,-p.r,-p.r,0,-p.r*.65);x.bezierCurveTo(p.r,-p.r,p.r,p.r*.2,0,p.r);x.fill();x.restore();
      }
      if(particles.length)frame=requestAnimationFrame(draw);else frame=0;
    };
    const move=(e:PointerEvent)=>{
      if(disabled||motion.matches||!pointer.matches||e.pointerType==='touch')return;
      const now=performance.now();if(now-last<38)return;last=now;
      particles.push({x:e.clientX,y:e.clientY,age:0,r:3+Math.random()*3,spin:Math.random()*6,vx:(Math.random()-.5)*30});
      if(particles.length>28)particles.shift();if(!frame){previous=now;frame=requestAnimationFrame(draw)};
    };
    const clear=()=>{particles=[];cancelAnimationFrame(frame);frame=0;x.clearRect(0,0,innerWidth,innerHeight)};
    resize();window.addEventListener('resize',resize);window.addEventListener('pointermove',move);window.addEventListener('blur',clear);motion.addEventListener('change',clear);
    return()=>{clear();window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('blur',clear);motion.removeEventListener('change',clear)};
  },[disabled]);
  return <canvas ref={ref} className="petal-cursor" aria-hidden="true"/>;
}
