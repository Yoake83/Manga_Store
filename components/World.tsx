'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import {TYPES,GENRES} from '@/lib/taxonomy';
import {createAudio} from '@/lib/audio';
import {makeRig,zFor} from '@/lib/rig';
import type {Series} from '@/lib/types';
import Reader from './Reader';
import PetalCursor from './PetalCursor';

const Scene=dynamic(()=>import('./world/Scene'),{ssr:false});

type Sel={type:number|null;genre:number|null};
const PROMPTS=[['',''],['Choose your world','Click a plate to step through the gate'],['Choose your genre','Click a lantern to light the way'],['Your shelf','Click a cover to open it']];

export default function World(){
  const rig=useRef(makeRig()),fx=useRef<HTMLDivElement>(null),audio=useRef<any>(null),selR=useRef<Sel>({type:null,genre:null}),tok=useRef(0);
  const [stage,setStage]=useState(0);
  const [sel,setSel]=useState<Sel>({type:null,genre:null});
  const [items,setItems]=useState<Series[]>([]);
  const [loading,setLoading]=useState(false);
  const [fonts,setFonts]=useState(false);
  const [ready,setReady]=useState(false);
  const [muted,setMuted]=useState(false);
  const [coarse,setCoarse]=useState(false);
  const [detail,setDetail]=useState<Series|null>(null);
  const [reading,setReading]=useState<Series|null>(null);
  const dialog=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!detail||reading)return;
    const previous=document.activeElement as HTMLElement|null,el=dialog.current;
    const buttons=()=>Array.from(el?.querySelectorAll<HTMLButtonElement>('button')??[]);
    buttons()[0]?.focus();
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();setDetail(null)}
      if(e.key==='Tab'){const b=buttons(),first=b[0],last=b[b.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
    };
    window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);previous?.focus()};
  },[detail,reading]);

  useEffect(()=>{
    const au=createAudio();audio.current=au;setMuted(au.isMuted());setCoarse(matchMedia('(pointer:coarse)').matches);
    let dead=false;
    Promise.race([document.fonts.load('800 100px "Shippori Mincho B1"','剣'),new Promise(r=>setTimeout(r,1800))]).catch(()=>{}).then(()=>{if(!dead)setFonts(true)});
    return()=>{dead=true;au.dispose();audio.current=null};
  },[]);
  useEffect(()=>{rig.current.paused=!!detail||!!reading},[detail,reading]);

  const loadShelf=useCallback(()=>{
    const t=++tok.current,s=selR.current;setLoading(true);
    fetch(`/api/series?type=${s.type??''}&genre=${s.genre??''}`).then(r=>r.json()).then(d=>{if(tok.current===t&&rig.current.stage===3)setItems(d.series||[])})
      .catch(()=>{}).finally(()=>{if(tok.current===t)setLoading(false)});
  },[]);
  const go=useCallback((s:number)=>{
    const r=rig.current;if(r.busy||s===r.stage)return;
    const now=performance.now();
    if((s===1||s===2)&&r.born[s]===Infinity)r.born[s]=now+500;
    if(s===3)loadShelf();
    audio.current?.whoosh();
    r.tw={f:r.cz,t:zFor(s,innerWidth/innerHeight),t0:now,d:s>r.stage?2000:1500};r.busy=true;r.stage=s;setStage(s);
  },[loadShelf]);
  const syncSel=()=>setSel({...selR.current});
  const enter=()=>{audio.current?.start();go(1)};
  const back=()=>{
    const r=rig.current;if(r.busy||r.stage<1)return;
    if(r.stage===3){selR.current.genre=null;tok.current++;setItems([]);setLoading(false)}
    if(r.stage===2)selR.current.type=null;
    syncSel();go(r.stage-1);
  };
  const onPick=useCallback((st:number,i:number)=>{
    if(st===1){selR.current.type=i;syncSel();go(2)}else if(st===2){selR.current.genre=i;syncSel();go(3)}
  },[go]);

  const base=stage===3&&loading?['Gathering stories…','']:PROMPTS[stage];
  const pr=coarse?base.map(t=>t.replace('Click','Tap')):base;
  const crumb=(i:number,label:string,v:string|null)=><span className={stage===i?'a':''}>{v??label}</span>;
  return(<>
    {fonts&&<Scene rig={rig} fx={fx} items={items} sel={sel} audio={audio.current} onPick={onPick} onOpen={setDetail} onReady={()=>setReady(true)}/>}
    <div id="fx" ref={fx}/><div id="vig"/>
    {ready&&<button className="mute" aria-label={muted?'Unmute sound':'Mute sound'} onClick={()=>{const m=!muted;audio.current?.setMuted(m);setMuted(m);if(!m)audio.current?.start()}}>{muted?'♪ off':'♪ on'}</button>}
    <PetalCursor disabled={!ready||!!detail||!!reading}/>
    <div id="ld" className={ready?'off':''} role="status" aria-label={ready?'World ready':'Loading the sakura world'}><span>夜明け<small>GATHERING THE DAWN</small></span></div>

    <div id="hero" className={'ov'+(stage===0?'':' off')} style={{opacity:stage===0?1:0}}>
      <div className="ht"><div className="k">夜明け</div><h1>YOAKE</h1>
        <p>A sakura-lit world of manga. Step through the gates to choose what you read.</p></div>
      <button className="btn" onClick={enter}>Enter the path</button>
    </div>

    <div id="hud" className={'ov'+(stage>0?' on':'')}>
      <button id="back" aria-label="Back" onClick={back}>←</button>
      <div id="crumb">
        {crumb(1,'Type',sel.type!=null?TYPES[sel.type].n:null)}<i>›</i>
        {crumb(2,'Genre',sel.genre!=null?GENRES[sel.genre].n:null)}<i>›</i>
        {crumb(3,'Shelf',null)}
      </div>
    </div>
    <div id="pr" className={'ov'+(stage>0?' on':'')}><h3>{pr[0]}</h3><p>{pr[1]}</p></div>

    {detail&&!reading&&<div className="md ov"><div ref={dialog} className="cd detail-card" role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="detail-art"><img key={detail.id} src={detail.cover} alt={`${detail.title} cover`} onError={e=>{e.currentTarget.style.visibility='hidden'}}/><span aria-hidden="true">夜明け</span></div><div className="detail-copy">
      <small>{detail.source==='mangadex'?'MangaDex':'Original'} · {sel.type!=null?TYPES[sel.type].n:''} {sel.genre!=null?`· ${GENRES[sel.genre].n}`:''}</small>
      <h2 id="detail-title">{detail.title}</h2>
      <p>{(detail.blurb||'No synopsis available.').replace(/[#*_>\[\]]/g,'').slice(0,300)}</p>
      <div className="row">
        <button className="btn" onClick={()=>setReading(detail)}>Read</button>
        <button className="btn" onClick={()=>setDetail(null)}>Close</button>
      </div>
    </div></div></div>}
    {reading&&<Reader series={reading} onClose={()=>{setReading(null);setDetail(null)}}/>}
  </>);
}
