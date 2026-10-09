'use client';
import {useEffect,useRef,useState} from 'react';
import type {Series,Chapter} from '@/lib/types';

export default function Reader({series,onClose}:{series:Series;onClose:()=>void}){
  const [chs,setChs]=useState<Chapter[]>([]);
  const [ci,setCi]=useState(0);
  const [pi,setPi]=useState(0);
  const [pages,setPages]=useState<string[]>([]);
  const [mode,setMode]=useState<'scroll'|'page'>('scroll');
  const [busy,setBusy]=useState(true);
  const [err,setErr]=useState('');
  const box=useRef<HTMLDivElement>(null);
  const key='yoake:'+series.id;

  useEffect(()=>{
    let dead=false;
    fetch('/api/chapters?id='+encodeURIComponent(series.id)).then(r=>r.json()).then(d=>{
      if(dead)return;
      const list:Chapter[]=d.chapters||[];
      if(!list.length){setErr('No readable chapters found.');setBusy(false);return}
      let c=0,p=0;
      try{const s=JSON.parse(localStorage.getItem(key)||'null');if(s){c=Math.min(s.c||0,list.length-1);p=s.p||0}}catch{}
      setChs(list);setCi(c);setPi(p);
    }).catch(()=>{if(!dead){setErr('Could not load chapters.');setBusy(false)}});
    return()=>{dead=true};
  },[series.id,key]);

  useEffect(()=>{
    const c=chs[ci];if(!c)return;
    let dead=false;setBusy(true);setErr('');setPages([]);
    fetch('/api/pages?id='+encodeURIComponent(c.id)).then(r=>r.json()).then(d=>{
      if(dead)return;
      const list:string[]=d.pages||[];
      setPages(list);setBusy(false);if(!list.length)setErr('This chapter has no pages.');
      box.current?.scrollTo(0,0);
    }).catch(()=>{if(!dead){setErr('Could not load pages.');setBusy(false)}});
    return()=>{dead=true};
  },[chs,ci]);

  useEffect(()=>{if(chs.length)try{localStorage.setItem(key,JSON.stringify({c:ci,p:pi}))}catch{}},[ci,pi,chs.length,key]);

  const openCh=(i:number)=>{setCi(i);setPi(0)};
  const next=()=>{if(pi<pages.length-1)setPi(pi+1);else if(ci<chs.length-1)openCh(ci+1)};
  const prev=()=>{if(pi>0)setPi(pi-1);else if(ci>0)openCh(ci-1)};

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(e.key==='Escape')onClose();
      else if(mode==='page'&&e.key==='ArrowRight')next();
      else if(mode==='page'&&e.key==='ArrowLeft')prev();
    };
    addEventListener('keydown',h);return()=>removeEventListener('keydown',h);
  });

  return(<div className="rd">
    <header>
      <b>{series.title}</b>
      {chs.length>0&&<select value={ci} onChange={e=>openCh(Number(e.target.value))} aria-label="Chapter">
        {chs.map((c,i)=><option key={c.id} value={i}>{c.label}{c.title?` · ${c.title}`:''}</option>)}
      </select>}
      <button className="btn sm" onClick={()=>setMode(mode==='scroll'?'page':'scroll')}>{mode==='scroll'?'Page mode':'Scroll mode'}</button>
      <button className="btn sm" onClick={onClose}>Close</button>
    </header>
    <div className={'rdb'+(mode==='page'?' pg':'')} ref={box}>
      {busy&&<div className="msg">Turning the pages…</div>}
      {!busy&&err&&<div className="msg">{err}</div>}
      {!busy&&!err&&mode==='scroll'&&<>
        {pages.map((u,i)=><img key={u} src={u} alt={`Page ${i+1}`} loading="lazy"/>)}
        {ci<chs.length-1&&<button className="btn" style={{margin:'24px 0'}} onClick={()=>openCh(ci+1)}>Next chapter →</button>}
      </>}
      {!busy&&!err&&mode==='page'&&pages[pi]&&<>
        <img src={pages[pi]} alt={`Page ${pi+1}`} onClick={next}/>
        {pages[pi+1]&&<img src={pages[pi+1]} alt="" style={{display:'none'}}/>}
      </>}
    </div>
    {mode==='page'&&pages.length>0&&<div className="rdf">← / → keys or tap the page · {pi+1} / {pages.length}</div>}
  </div>);
}
