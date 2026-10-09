import type {Source,Series} from '../types';
export const ORIGINALS=[
  {slug:'petal-blade',title:'Petal & Blade',kanji:'花',hue:340,types:[0,1],genres:[0,2],blurb:'A swordswoman guards the last cherry tree of a drowned city.'},
  {slug:'last-lantern',title:'The Last Lantern',kanji:'灯',hue:30,types:[2],genres:[3,6],blurb:'Every lantern in the village has gone dark except one. Who keeps lighting it?'},
  {slug:'moonlit-courier',title:'Moonlit Courier',kanji:'月',hue:225,types:[0,3],genres:[2,5],blurb:'A courier delivers letters between worlds, only after moonrise.'},
  {slug:'night-ramen',title:'Night Ramen',kanji:'麺',hue:20,types:[2,3],genres:[4,7],blurb:'A ramen stall that only opens at 3 a.m. and serves very strange regulars.'},
  {slug:'sakura-protocol',title:'Sakura Protocol',kanji:'桜',hue:330,types:[1,4],genres:[1,6],blurb:'Two rival students discover the school festival hides a secret programme.'},
  {slug:'paper-kingdom',title:'Paper Kingdom',kanji:'紙',hue:180,types:[4,5],genres:[2,5],blurb:'Fold the right crane and a whole kingdom unfolds around you.'},
];
const find=(slug:string)=>ORIGINALS.find(o=>o.slug===slug);
export const original:Source={
  async series(f){
    let m=ORIGINALS.filter(o=>(f.type==null||o.types.includes(f.type))&&(f.genre==null||o.genres.includes(f.genre)));
    if(!m.length)m=ORIGINALS;
    return m.map((o):Series=>({id:'orig:'+o.slug,title:o.title,source:'original',blurb:o.blurb,cover:`/api/orig?k=cover&s=${o.slug}`}));
  },
  async chapters(id){
    const s=id.split(':')[1];if(!find(s))return [];
    return [1,2,3].map(n=>({id:`orig:${s}:${n}`,label:'Ch. '+n,title:['Prologue','The Gate','Dawn'][n-1]}));
  },
  async pages(cid){
    const [,s,c]=cid.split(':');
    return Array.from({length:6},(_,i)=>`/api/orig?k=page&s=${s}&c=${c}&p=${i+1}`);
  },
};
