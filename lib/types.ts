export type Series={id:string;title:string;cover:string;source:'mangadex'|'original';blurb?:string};
export type Chapter={id:string;label:string;title?:string};
export type Filter={type:number|null;genre:number|null};
export interface Source{
  series(f:Filter):Promise<Series[]>;
  chapters(id:string):Promise<Chapter[]>;
  pages(chapterId:string):Promise<string[]>;
}
