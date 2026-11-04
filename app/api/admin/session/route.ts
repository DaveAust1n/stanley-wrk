import {adminSession} from '../../../../lib/admin-session';
import {adminBackend,adminReply,adminFailure,clientIp} from '../../../../lib/admin-backend';
import {AdminError,adminJson,sameOrigin} from '../../../../lib/admin-contract';
export const runtime='nodejs';
export async function POST(request:Request){try{
 sameOrigin(request);
 const raw=await request.text();if(raw.length>2048)throw new AdminError(400,'Invalid sign-in request.');
 const body=adminJson(raw);
 if(typeof body.code!=='string'||!body.code||body.code.length>256)throw new AdminError(400,'Enter your admin code.');
 await adminBackend('/admin/payments?status=submitted',body.code,clientIp(request));
 const session=await adminSession();session.adminCode=body.code;session.expiresAt=Date.now()+1800000;await session.save();
 return adminReply({ok:true});
 }catch(error){return adminFailure(error);}}
export async function DELETE(request:Request){try{sameOrigin(request);const session=await adminSession();session.destroy();return adminReply({ok:true});}catch(error){return adminFailure(error);}}
