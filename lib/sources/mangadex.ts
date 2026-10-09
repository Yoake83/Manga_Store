import {TYPES,GENRES} from '../taxonomy';
import type {Source,Series,Chapter} from '../types';

const API='https://api.mangadex.org';
const UA={'User-Agent':'yoake-demo/0.2'};
const SAFE='&contentRating[]=safe&contentRating[]=suggestive';
let tags:Record<string,string>|null=null;

async function j(path:string,revalidate=3600){
  const r=await fetch(API+path,{headers:UA,...(revalidate===0?{cache:'no-store' as const}:{next:{revalidate}})});
  if(!r.ok)throw new Error('mangadex '+r.status);
  return r.json();
}
async function tagId(name:string){
  if(!tags){const d=await j('/manga/tag',86400);tags={};for(const t of d.data)tags[t.attributes.name.en]=t.id}
  return tags[name];
}
const proxy=(u:string)=>'/api/img?u='+encodeURIComponent(u);

export const mangadex:Source={
  async series(f){
    const q=['limit=10','includes[]=cover_art','hasAvailableChapters=true','availableTranslatedLanguage[]=en','order[followedCount]=desc'];
    const t=f.type!=null?TYPES[f.type]:null;
    if(t?.demo)q.push('publicationDemographic[]='+t.demo);
    t?.lang?.forEach(l=>q.push('originalLanguage[]='+l));
    if(f.genre!=null){const id=await tagId(GENRES[f.genre].n);if(id)q.push('includedTags[]='+id)}
    const d=await j('/manga?'+q.join('&')+SAFE,1800);
    return d.data.map((m:any):Series=>{
      const file=m.relationships.find((r:any)=>r.type==='cover_art')?.attributes?.fileName;
      const title=m.attributes.title.en||(Object.values(m.attributes.title)[0] as string)||'Untitled';
      return {id:m.id,title,source:'mangadex',blurb:m.attributes.description?.en,
        cover:file?`https://uploads.mangadex.org/covers/${m.id}/${file}.512.jpg`:''};
    }).filter((s:Series)=>s.cover);
  },
  async chapters(id){
    const d=await j(`/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=100&includeExternalUrl=0${SAFE}`,600);
    const seen=new Set<string>(),out:Chapter[]=[];
    for(const c of d.data){
      if(!c.attributes.pages)continue;
      const n=c.attributes.chapter||'Oneshot';
      if(seen.has(n))continue;seen.add(n);
      out.push({id:c.id,label:'Ch. '+n,title:c.attributes.title||undefined});
    }
    return out;
  },
  async pages(cid){
    const d=await j('/at-home/server/'+cid,0);
    return d.chapter.data.map((f:string)=>proxy(`${d.baseUrl}/data/${d.chapter.hash}/${f}`));
  },
};
