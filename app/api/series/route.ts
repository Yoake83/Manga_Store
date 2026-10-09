import {NextRequest,NextResponse} from 'next/server';
import {listSeries} from '@/lib/sources';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
  const p=req.nextUrl.searchParams;
  const n=(k:string)=>{const v=p.get(k);return v===null||v===''||isNaN(Number(v))?null:Number(v)};
  return NextResponse.json({series:await listSeries({type:n('type'),genre:n('genre')})});
}
