import {loadAsset} from '../../../../lib/studio-storage';
export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}){const {key}=await params;if(!/^[a-f0-9-]{36}$/.test(key))return new Response('Not found',{status:404});try{return await loadAsset(key)}catch{return Response.json({error:'Unable to load media. Please retry.'},{status:502})}}
