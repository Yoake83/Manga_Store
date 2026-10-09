import type {MutableRefObject} from 'react';
export type Tween={f:number;t:number;t0:number;d:number};
/** Mutable, per-frame state shared between React (UI) and the R3F scene. */
export type Rig={stage:number;busy:boolean;paused:boolean;cz:number;burst:number;tw:Tween|null;born:Record<number,number>};
export type RigRef=MutableRefObject<Rig>;
export const makeRig=():Rig=>({stage:0,busy:false,paused:false,cz:16,burst:0,tw:null,born:{1:Infinity,2:Infinity}});
export const zFor=(s:number,aspect:number)=>{const back=aspect<1?Math.min(10,(1/aspect-1)*5):0;return [16,4,-26,-58][s]+back};
export const isMobile=()=>matchMedia('(pointer:coarse)').matches||innerWidth<768;
export const prefersReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
