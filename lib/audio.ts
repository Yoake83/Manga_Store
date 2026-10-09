/* Procedural ambience: no audio files. Starts only after a user gesture. */
export function createAudio(){
  let ctx:AudioContext|null=null,master:GainNode,delay:DelayNode,nb:AudioBuffer,muted=false,started=false,timer:any=0;
  try{muted=localStorage.getItem('yoake:muted')==='1'}catch{}
  const P=[293.66,329.63,369.99,440,493.88,587.33,659.25,739.99,880];
  const pluck=(f:number,v=.08,dur=1.8)=>{
    if(!ctx||muted||ctx.state!=='running')return;
    const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
    o.type='triangle';o.frequency.value=f;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(master);g.connect(delay);o.start(t);o.stop(t+dur+.05);
  };
  const start=()=>{
    if(started){ctx?.resume();return}
    started=true;
    ctx=new (window.AudioContext||(window as any).webkitAudioContext)();
    master=ctx.createGain();master.gain.value=muted?0:.8;master.connect(ctx.destination);
    delay=ctx.createDelay(1);delay.delayTime.value=.38;
    const fb=ctx.createGain();fb.gain.value=.38;const dl=ctx.createGain();dl.gain.value=.5;
    delay.connect(fb);fb.connect(delay);delay.connect(dl);dl.connect(master);
    nb=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    /* soft pad */
    const pad=ctx.createGain();pad.gain.value=.05;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;pad.connect(lp);lp.connect(master);
    [146.83,220,293.66,369.99].forEach((f,i)=>{
      const o=ctx!.createOscillator(),lfo=ctx!.createOscillator(),lg=ctx!.createGain();
      o.type='sine';o.frequency.value=f;o.detune.value=(i-1.5)*4;
      lfo.frequency.value=.05+i*.03;lg.gain.value=3;lfo.connect(lg);lg.connect(o.detune);
      o.connect(pad);o.start();lfo.start();
    });
    /* wind */
    const n=ctx.createBufferSource();n.buffer=nb;n.loop=true;
    const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=500;bp.Q.value=.6;
    const wg=ctx.createGain();wg.gain.value=.05;
    const wl=ctx.createOscillator(),wlg=ctx.createGain();wl.frequency.value=.08;wlg.gain.value=250;wl.connect(wlg);wlg.connect(bp.frequency);
    n.connect(bp);bp.connect(wg);wg.connect(master);n.start();wl.start();
    /* random koto-like plucks */
    const loop=()=>{pluck(P[Math.floor(Math.random()*P.length)],.05,2.6);timer=setTimeout(loop,2500+Math.random()*4000)};
    timer=setTimeout(loop,1500);
    document.addEventListener('visibilitychange',onVis);
  };
  const onVis=()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(!muted)ctx.resume()};
  return{
    start,
    isMuted:()=>muted,
    setMuted(m:boolean){muted=m;try{localStorage.setItem('yoake:muted',m?'1':'0')}catch{}
      if(master&&ctx)master.gain.setTargetAtTime(m?0:.8,ctx.currentTime,.1);if(!m)ctx?.resume()},
    hover(){pluck(P[4+Math.floor(Math.random()*5)],.035,.5)},
    choose(){[2,4,6].forEach((k,i)=>setTimeout(()=>pluck(P[k],.07,1.6),i*70))},
    whoosh(){
      if(!ctx||muted||ctx.state!=='running')return;
      const t=ctx.currentTime,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      s.buffer=nb;f.type='bandpass';f.Q.value=1.2;
      f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(2800,t+1);f.frequency.exponentialRampToValueAtTime(400,t+1.8);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.8);g.gain.exponentialRampToValueAtTime(.0001,t+1.9);
      s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+2);
    },
    dispose(){clearTimeout(timer);document.removeEventListener('visibilitychange',onVis);ctx?.close()},
  };
}
