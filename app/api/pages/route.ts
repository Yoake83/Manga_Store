import {NextRequest,NextResponse} from 'next/server';
import {pickSource} from '@/lib/sources';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
  const id=req.nextUrl.searchParams.get('id')||'';
  const pages=await pickSource(id).pages(id).catch(()=>[]);
  return NextResponse.json({pages});
}
