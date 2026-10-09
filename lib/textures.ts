import * as THREE from 'three';

/* ---------- canvas drawing helpers ---------- */
export const blossom=(x:CanvasRenderingContext2D,cx:number,cy:number,r:number,rot:number,al=1)=>{
  x.save();x.translate(cx,cy);x.rotate(rot);x.globalAlpha=al;
  for(let i=0;i<5;i++){x.rotate(Math.PI*2/5);x.beginPath();x.moveTo(0,0);
    x.bezierCurveTo(-r*.55,-r*.35,-r*.5,-r*1.0,-r*.12,-r*.98);x.lineTo(0,-r*.84);x.lineTo(r*.12,-r*.98);x.bezierCurveTo(r*.5,-r*1.0,r*.55,-r*.35,0,0);x.closePath();
    const g=x.createRadialGradient(0,-r*.2,0,0,-r*.6,r);g.addColorStop(0,'#fff7fa');g.addColorStop(1,'#ffb3c8');x.fillStyle=g;x.fill();
    x.strokeStyle='rgba(232,100,140,.7)';x.lineWidth=Math.max(1,r*.04);x.stroke()}
  x.beginPath();x.arc(0,0,r*.14,0,7);x.fillStyle='#ffe08a';x.fill();x.restore()};
export const branch=(x:CanvasRenderingContext2D)=>{
  x.save();x.strokeStyle='#5a3446';x.lineCap='round';x.lineWidth=8;x.beginPath();x.moveTo(6,130);x.quadraticCurveTo(70,78,200,52);x.stroke();
  x.lineWidth=4;x.beginPath();x.moveTo(62,88);x.quadraticCurveTo(92,126,102,168);x.stroke();
  blossom(x,58,100,26,.3);blossom(x,128,66,22,1.2);blossom(x,200,50,17,2.1);blossom(x,100,164,15,.8);blossom(x,24,150,12,.5);x.restore()};
export const card=(k:string,t:string,d:string,h:number)=>{
  const W=512,H=768,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d')!;
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${h},38%,17%)`);g.addColorStop(1,'#150a22');x.fillStyle=g;x.fillRect(0,0,W,H);
  const rg=x.createRadialGradient(W/2,300,10,W/2,300,240);rg.addColorStop(0,`hsla(${h},90%,75%,.55)`);rg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=rg;x.fillRect(0,40,W,520);
  x.save();x.translate(W/2,300);for(let a=0;a<48;a++){const an=a/48*6.283;x.strokeStyle='rgba(255,220,232,'+(a%2?.07:.13)+')';x.lineWidth=a%2?1:2;x.beginPath();x.moveTo(Math.cos(an)*120,Math.sin(an)*120);x.lineTo(Math.cos(an)*520,Math.sin(an)*520);x.stroke()}x.restore();
  for(let y=520;y<H;y+=14)for(let xx=0;xx<W;xx+=14){const r=Math.max(0,4.2*((y-520)/250)*(1-Math.abs(xx-W/2)/(W*.75)));x.fillStyle=`hsla(${h},85%,72%,.25)`;x.beginPath();x.arc(xx+((y/14)%2?7:0),y,r,0,7);x.fill()}
  branch(x);
  x.save();x.strokeStyle=`hsla(${h},90%,82%,.55)`;x.lineWidth=7;x.lineCap='round';x.shadowColor=`hsl(${h},100%,70%)`;x.shadowBlur=18;x.beginPath();x.arc(W/2,305,178,.35*Math.PI,2.15*Math.PI);x.stroke();x.restore();
  x.textAlign='center';x.fillStyle='#fff6f9';x.shadowColor=`hsl(${h},100%,70%)`;x.shadowBlur=26;
  const kc=[...k];
  if(kc.length===1){x.font='800 250px "Shippori Mincho B1",serif';x.fillText(k,W/2,400)}
  else{x.font='800 128px "Shippori Mincho B1",serif';kc.slice(0,2).forEach((ch,i)=>x.fillText(ch,W/2,262+i*132))}
  x.shadowBlur=0;
  blossom(x,440,520,13,.4,.9);blossom(x,468,548,9,1.4,.85);blossom(x,72,530,10,.9,.85);
  x.fillStyle='rgba(12,6,22,.74)';x.fillRect(40,560,W-80,150);x.strokeStyle='rgba(255,196,214,.55)';x.lineWidth=2;x.strokeRect(40,560,W-80,150);
  x.fillStyle='#fff3f6';x.font=`800 ${t.length>13?32:44}px "Shippori Mincho B1",serif`;x.fillText(t.length>22?t.slice(0,21)+'…':t,W/2,628);
  x.fillStyle='#ffb7cc';x.font='500 20px "Space Grotesk",sans-serif';x.fillText(d.toUpperCase(),W/2,672);
  x.fillStyle='#c8323c';x.fillRect(W-122,52,62,62);x.fillStyle='#fff3f6';x.font='800 42px "Shippori Mincho B1",serif';x.fillText('桜',W-91,98);
  x.strokeStyle='#ffd1de';x.lineWidth=8;x.strokeRect(8,8,W-16,H-16);x.strokeStyle='#e9c987';x.lineWidth=2;x.strokeRect(22,22,W-44,H-44);
  const tx=new THREE.CanvasTexture(c);tx.anisotropy=4;return tx};
export const lanternTex=(k:string,h:number)=>{
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d')!;
  const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,`hsl(${h},85%,66%)`);g.addColorStop(.5,`hsl(${h},95%,80%)`);g.addColorStop(1,`hsl(${h},85%,62%)`);x.fillStyle=g;x.fillRect(0,0,512,256);
  x.strokeStyle='rgba(90,20,50,.5)';x.lineWidth=3;for(let i=0;i<=9;i++){const y=14+i*25.5;x.beginPath();x.moveTo(0,y);x.lineTo(512,y);x.stroke()}
  x.textAlign='center';x.fillStyle='#4a0f26';x.font='800 150px "Shippori Mincho B1",serif';x.fillText(k,0,172);x.fillText(k,512,172);
  return new THREE.CanvasTexture(c)};
export const plaque=(n:string,d:string)=>{
  const c=document.createElement('canvas');c.width=512;c.height=200;const x=c.getContext('2d')!;
  x.fillStyle='#2a1620';x.beginPath();x.moveTo(40,10);x.lineTo(472,10);x.quadraticCurveTo(502,10,502,40);x.lineTo(502,160);x.quadraticCurveTo(502,190,472,190);x.lineTo(40,190);x.quadraticCurveTo(10,190,10,160);x.lineTo(10,40);x.quadraticCurveTo(10,10,40,10);x.fill();
  x.strokeStyle='rgba(255,196,214,.85)';x.lineWidth=4;x.stroke();
  x.textAlign='center';x.fillStyle='#fff3f6';x.font=`800 ${n.length>9?44:54}px "Shippori Mincho B1",serif`;x.fillText(n,256,96);
  x.fillStyle='#ffb7cc';x.font='500 24px "Space Grotesk",sans-serif';x.fillText(d.toUpperCase(),256,148);
  blossom(x,44,100,14,.3,.9);blossom(x,468,100,14,1,.9);
  return new THREE.CanvasTexture(c)};
export const titleTex=(t:string)=>{const c=document.createElement('canvas');c.width=512;c.height=100;const x=c.getContext('2d')!;
  const q=t.length>26?t.slice(0,25)+'…':t;x.font='700 34px "Space Grotesk",sans-serif';const w=Math.min(504,x.measureText(q).width+52);
  x.fillStyle='rgba(14,6,26,.85)';x.fillRect(256-w/2,20,w,60);x.strokeStyle='rgba(255,196,214,.75)';x.lineWidth=2;x.strokeRect(256-w/2,20,w,60);
  x.textAlign='center';x.fillStyle='#fff3f6';x.fillText(q,256,62);return new THREE.CanvasTexture(c)};
export const glowTex=()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d')!,g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,225,235,.95)');g.addColorStop(.4,'rgba(255,140,175,.35)');g.addColorStop(1,'rgba(255,140,175,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)};
export const petalTex=()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d')!;x.translate(32,32);x.rotate(-.5);
  x.beginPath();x.moveTo(0,22);x.bezierCurveTo(-24,6,-18,-22,-4,-24);x.lineTo(0,-18);x.lineTo(4,-24);x.bezierCurveTo(18,-22,24,6,0,22);x.closePath();
  const g=x.createLinearGradient(0,-24,0,22);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffb0c8');x.fillStyle=g;x.fill();return new THREE.CanvasTexture(c)};
export const pathTex=()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d')!;x.fillStyle='#2b2033';x.fillRect(0,0,512,512);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=`hsl(${300+Math.random()*20},${12+Math.random()*8}%,${34+Math.random()*10}%)`;x.fillRect(i*128+4,j*128+4,120,120)}
  for(let i=0;i<110;i++){x.save();x.translate(Math.random()*512,Math.random()*512);x.rotate(Math.random()*6);x.fillStyle=`rgba(255,${170+Math.random()*50},${190+Math.random()*40},.85)`;x.beginPath();x.ellipse(0,0,7,4,0,0,7);x.fill();x.restore()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,40);t.anisotropy=8;return t};

export const streakTex=(c1:string,c2:string)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d')!;x.fillStyle=c1;x.fillRect(0,0,256,256);
  for(let i=0;i<170;i++){x.strokeStyle=c2;x.globalAlpha=.06+Math.random()*.22;x.lineWidth=1+Math.random()*3;const px=Math.random()*256;x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px+Math.random()*8-4,80,px+Math.random()*8-4,170,px+Math.random()*6-3,256);x.stroke()}
  x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};
export const stoneTex=()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d')!;x.fillStyle='#74667c';x.fillRect(0,0,256,256);
  for(let i=0;i<1400;i++){x.fillStyle=`rgba(${Math.random()<.5?'255,255,255':'30,20,40'},${Math.random()*.12})`;x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*3)}
  x.strokeStyle='rgba(30,20,40,.35)';x.lineWidth=1.5;for(let i=0;i<5;i++){x.beginPath();let px=Math.random()*256,py=Math.random()*256;x.moveTo(px,py);for(let k=0;k<5;k++){px+=Math.random()*40-20;py+=Math.random()*40-20;x.lineTo(px,py)}x.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
export const mistTex=()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d')!,g=x.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.5,'rgba(255,255,255,.2)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)};


/** Layered mountain silhouette that fades into haze at its base. rgb = [r,g,b]. */
export const ridgeTex=(rgb:number[],seed:number,amp:number)=>{
  const c=document.createElement('canvas');c.width=1024;c.height=256;const x=c.getContext('2d')!;
  let s=seed;const r=()=>{s=(s*16807)%2147483647;return s/2147483647},ph=[r()*6,r()*6,r()*6,r()*6],k=rgb.join(',');
  const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,`rgba(${k},1)`);g.addColorStop(.7,`rgba(${k},1)`);g.addColorStop(1,`rgba(${k},0)`);
  x.beginPath();x.moveTo(0,256);
  for(let i=0;i<=1024;i+=4){const u=i/1024*6.2832,h=110+amp*(Math.sin(u*1.3+ph[0])*38+Math.sin(u*3.1+ph[1])*22+Math.sin(u*7.3+ph[2])*10+Math.sin(u*15+ph[3])*4);x.lineTo(i,256-h)}
  x.lineTo(1024,256);x.closePath();x.fillStyle=g;x.fill();return new THREE.CanvasTexture(c)};
/** Soft vertical light shaft (bright at the top, fading down, gaussian across). */
export const beamTex=()=>{
  const c=document.createElement('canvas');c.width=128;c.height=256;const x=c.getContext('2d')!,img=x.createImageData(128,256);
  for(let y=0;y<256;y++)for(let i=0;i<128;i++){const dx=(i-64)/30,a=Math.exp(-dx*dx)*Math.pow(1-y/256,1.4),o=(y*128+i)*4;img.data[o]=255;img.data[o+1]=255;img.data[o+2]=255;img.data[o+3]=a*255}
  x.putImageData(img,0,0);return new THREE.CanvasTexture(c)};