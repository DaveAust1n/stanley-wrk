import {checkBackend} from '../../../lib/studio-storage';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await checkBackend(),{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({ok:false,error:'Backend connection failed.'},{status:502,headers:{'Cache-Control':'no-store'}})}}
