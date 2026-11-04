import {AdminError} from './admin-contract';
const errors:Record<string,string>={unauthorized:'The admin code was not accepted. Sign in again.',rate_limited:'Too many attempts. Please try again later.',payment_not_found:'This payment no longer exists.',order_not_found:'This order no longer exists.',payment_not_submitted:'Only submitted payments can be reviewed.',order_already_paid:'This order has already been paid.',order_not_paid:'Delivery status can only be changed after payment is confirmed.',invalid_status:'Choose a valid status.'};
export function adminConfigured(){return !!process.env.CHECKOUT_BACKEND_URL&&!!process.env.CHECKOUT_BACKEND_TOKEN&&!!process.env.ADMIN_SESSION_SECRET&&process.env.ADMIN_SESSION_SECRET.length>=32;}
export async function adminBackend(path:string,adminCode:string,ip:string,init:RequestInit={}){
 const url=process.env.CHECKOUT_BACKEND_URL,token=process.env.CHECKOUT_BACKEND_TOKEN;
 if(!url||!token)throw new AdminError(503,'The admin backend is not configured yet.');
 let response:Response;
 try{response=await fetch(url.replace(/\/$/,'')+path,{...init,cache:'no-store',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json','x-checkout-key':token,'x-admin-key':adminCode,'x-client-ip':ip}});}catch{throw new AdminError(503,'The payment backend could not be reached. Try again.');}
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new AdminError(response.status,errors[data?.error]||'The payment backend could not complete this request. Refresh and try again.');
 return data;
}
export function clientIp(request:Request){return (request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-real-ip')||'unknown').split(',')[0].trim().slice(0,64);}
export function adminReply(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store, max-age=0','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});}
export function adminFailure(error:unknown){return adminReply({error:error instanceof AdminError?error.message:'The request could not be completed.'},error instanceof AdminError?error.status:500);}
