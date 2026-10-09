import {NextRequest} from 'next/server';
import {ORIGINALS} from '@/lib/sources/original';
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as Record<string,string>)[c]);
const LINES=['The petals never stop falling.','Hold the line!','I will return at dawn.','Who lit the lantern?','This is not over.','Look... the moon.','One more bowl, please!','We cross at midnight.'];
const rng=(seed:number)=>()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const hash=(s:string)=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const defs='<defs><pattern id="ht" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="#fff" fill-opacity=".22"/></pattern></defs>';
const speed=(cx:number,cy:number,r1:number,r2:number,n:number,r:()=>number)=>{let d='';for(let i=0;i<n;i++){const a=r()*6.283;d+=`M${(cx+Math.cos(a)*r1).toFixed(0)} ${(cy+Math.sin(a)*r1).toFixed(0)}L${(cx+Math.cos(a)*r2).toFixed(0)} ${(cy+Math.sin(a)*r2).toFixed(0)}`}return d};
const svg=(w:number,h:number,body:string)=>new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs}${body}</svg>`,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=3600'}});

export async function GET(req:NextRequest){
  const q=req.nextUrl.searchParams,o=ORIGINALS.find(x=>x.slug===q.get('s'));
  if(!o)return new Response('not found',{status:404});
  if(q.get('k')==='cover'){
    const r=rng(hash(o.slug));
    return svg(600,840,`<rect width="600" height="840" fill="hsl(${o.hue},60%,20%)"/><rect width="600" height="840" fill="url(#ht)"/>
<path d="${speed(300,380,110,520,70,r)}" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
<text x="300" y="470" font-size="340" text-anchor="middle" fill="#fff3f6" stroke="hsl(${o.hue},100%,70%)" stroke-width="6" font-family="serif" font-weight="800">${o.kanji}</text>
<rect x="30" y="680" width="540" height="120" fill="#10061c"/><text x="300" y="755" font-size="46" text-anchor="middle" fill="#fff3f6" font-family="sans-serif" font-weight="700">${esc(o.title)}</text>
<rect x="10" y="10" width="580" height="820" fill="none" stroke="#fff3f6" stroke-width="8"/>`);
  }
  const c=Number(q.get('c')||1),p=Number(q.get('p')||1),r=rng(hash(o.slug)+c*97+p*13);
  const W=800,H=1130,m=36,g=18,rows=3+(r()>.5?1:0),hs=Array.from({length:rows},()=>.6+r()),sum=hs.reduce((a,b)=>a+b,0);
  let y=m,n=0,out=`<rect width="${W}" height="${H}" fill="#f8f4ee"/>`;
  for(let i=0;i<rows;i++){
    const h=(H-2*m-g*(rows-1))*hs[i]/sum,cols=1+Math.floor(r()*3),ws=Array.from({length:cols},()=>.7+r()),ws2=ws.reduce((a,b)=>a+b,0);
    let x=m;
    for(let j=0;j<cols;j++){
      const w=(W-2*m-g*(cols-1))*ws[j]/ws2,id='p'+(n++),hue=(o.hue+Math.floor(r()*50)-25+360)%360;
      out+=`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="hsl(${hue},55%,${18+r()*14}%)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ht)"/>
<path d="${speed(x+w*(.3+r()*.4),y+h*(.3+r()*.4),40,Math.max(w,h),26,r)}" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>`;
      if(r()>.45)out+=`<text x="${x+w/2}" y="${y+h*.72}" font-size="${Math.min(w,h)*.6}" text-anchor="middle" fill="#fff" stroke="#111" stroke-width="4" font-family="serif" font-weight="800">${o.kanji}</text>`;
      if(r()>.4){const ln=LINES[Math.floor(r()*LINES.length)],rx=Math.min(w*.4,150),fs=Math.max(11,Math.min(18,rx*1.8/(ln.length*.55)));
        out+=`<ellipse cx="${x+w/2}" cy="${y+h*.24}" rx="${rx}" ry="40" fill="#fff" stroke="#111" stroke-width="3"/><text x="${x+w/2}" y="${y+h*.24+5}" font-size="${fs}" text-anchor="middle" fill="#111" font-family="sans-serif" font-weight="700">${esc(ln)}</text>`}
      out+=`</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#111" stroke-width="5"/>`;
      x+=w+g;
    }
    y+=h+g;
  }
  return svg(W,H,out+`<text x="${W/2}" y="${H-12}" font-size="16" text-anchor="middle" fill="#555" font-family="sans-serif">${esc(o.title)} · Ch.${c} · ${p}</text>`);
}
