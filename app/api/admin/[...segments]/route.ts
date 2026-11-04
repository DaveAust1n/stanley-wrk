import {adminSession,sessionActive} from '../../../../lib/admin-session';
import {adminBackend,adminReply,adminFailure,clientIp} from '../../../../lib/admin-backend';
import {AdminError,adminJson,adminDestination,adminCommand,sameOrigin} from '../../../../lib/admin-contract';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{segments:string[]}>};
async function handle(request:Request,context:Context){try{
 if(request.method==='POST')sameOrigin(request);
 const session=await adminSession();if(!sessionActive(session)){session.destroy();throw new AdminError(401,'Sign in to review payments.');}
 const {segments}=await context.params;
 const path=adminDestination(segments,request.method,new URL(request.url).searchParams.get('status'));
 let body:unknown;
 if(request.method==='POST'){const raw=await request.text();if(raw.length>4000)throw new AdminError(400,'The request is too large.');body=adminCommand(path,adminJson(raw));}
 try{return adminReply(await adminBackend(path,session.adminCode!,clientIp(request),{method:request.method,...(body?{body:JSON.stringify(body)}:{})}));}
 catch(error){if(error instanceof AdminError&&error.status===401)session.destroy();throw error;}
 }catch(error){return adminFailure(error);}}
export const GET=handle;export const POST=handle;
