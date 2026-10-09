export const dynamic='force-dynamic';
export async function GET(req:Request){
  const u=new URL(req.url).searchParams.get('u')||'';
  let t:URL;
  try{t=new URL(u)}catch{return new Response('bad url',{status:400})}
  const ok=t.protocol==='https:'&&(t.hostname==='uploads.mangadex.org'||t.hostname.endsWith('.mangadex.network'));
  if(!ok)return new Response('forbidden',{status:403});
  const r=await fetch(t,{headers:{'User-Agent':'yoake-demo/0.2'},redirect:'manual'}).catch(()=>null);
  if(!r||!r.ok||!r.body)return new Response('upstream error',{status:502});
  return new Response(r.body,{headers:{'Content-Type':r.headers.get('content-type')||'image/jpeg','Cache-Control':'public, max-age=86400'}});
}
