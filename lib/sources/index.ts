import {mangadex} from './mangadex';
import {original} from './original';
import type {Filter,Series} from '../types';
export const pickSource=(id:string)=>id.startsWith('orig:')?original:mangadex;
const proxy=(u:string)=>u.startsWith('https://')?'/api/img?u='+encodeURIComponent(u):u;
export async function listSeries(f:Filter):Promise<Series[]>{
  const mode=process.env.MANGA_SOURCE||'both';
  let md:Series[]=[],og:Series[]=[];
  if(mode!=='original'){try{md=await mangadex.series(f)}catch(e){console.warn('[yoake] mangadex failed:',(e as Error).message)}}
  if(mode!=='mangadex'||!md.length)og=await original.series(f);
  return [...md.slice(0,7),...og].slice(0,10).map(s=>({...s,cover:proxy(s.cover)}));
}
