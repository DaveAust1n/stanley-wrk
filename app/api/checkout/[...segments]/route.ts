import {createHash} from 'node:crypto';
import {sameOrigin,adminJson,AdminError} from '../../../../lib/admin-contract';
import {clientIp} from '../../../../lib/admin-backend';
import {checkoutBackend,checkoutReply} from '../../../../lib/customer-backend';
import {CheckoutError,pricedOrder} from '../../../../lib/customer-contract';
import {customerSession,ownsOrder} from '../../../../lib/customer-session';
import {loadDocument} from '../../../../lib/studio-storage';
export const runtime='nodejs';export const dynamic='force-dynamic';
type Context={params:Promise<{segments:string[]}>};
const codePattern=/^ORD-[A-F0-9]{12}$/;
async function handle(request:Request,{params}:Context){try{
 const {segments}=await params;const path=segments.join('/'),ip=clientIp(request);
 if(request.method==='POST')sameOrigin(request);
 if(request.method==='GET'&&path==='status'){await checkoutBackend('/health',ip);const settings=(await loadDocument('published.json')).document?.orderForm;return checkoutReply({backend:true,pricesPublished:!!settings?.vehicles.some(v=>typeof v.price==='number')&&typeof settings?.deliveryFee==='number'&&!!settings?.deliveryOptions.some(d=>typeof d.price==='number')});}
 if(request.method==='GET'&&segments.length===2&&segments[0]==='track'){
  const code=segments[1].trim().toUpperCase();if(!/^(ORD|TRK)-[A-F0-9]{12}$/.test(code))throw new CheckoutError(400,'Enter a valid order or tracking reference.');
  return checkoutReply(await checkoutBackend('/track/'+code,ip));
 }
 const session=await customerSession();
 if(request.method==='POST'&&path==='orders'){
  const raw=await request.text();if(raw.length>12000)throw new CheckoutError(400,'The order details are too long.');const body=adminJson(raw);
  const settings=(await loadDocument('published.json')).document?.orderForm;
  let payload:ReturnType<typeof pricedOrder>;try{payload=pricedOrder(settings,body);}catch(e){if(e instanceof CheckoutError&&e.status===409)return checkoutReply({error:e.message,settings},409);throw e;}
  const fingerprint=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const previous=session.lastRequest;if(previous&&previous.id===body.requestId&&previous.fingerprint===fingerprint&&ownsOrder(session,previous.code))return checkoutReply({code:previous.code,reused:true});
  const result=await checkoutBackend('/orders',ip,{method:'POST',body:JSON.stringify(payload)});
  if(!result||!codePattern.test(result.code))throw new CheckoutError(503,'The order could not be saved. Please try again.');
  session.orders=[...new Set([...(session.orders||[]),result.code])].slice(-12);session.lastRequest={id:String(body.requestId),fingerprint,code:result.code};await session.save();return checkoutReply(result,201);
 }
 if(segments[0]!=='orders'||!codePattern.test(segments[1]||''))throw new CheckoutError(404,'This checkout page could not be found.');
 const code=segments[1];if(!ownsOrder(session,code))throw new CheckoutError(403,'Open this payment request in the browser where you created the order. You can still track it using your reference.');
 if(request.method==='GET'&&segments.length===2)return checkoutReply(await checkoutBackend('/orders/'+code,ip));
 if(request.method==='POST'&&segments.length===3&&segments[2]==='payments'){
  const raw=await request.text();if(raw.length>2000)throw new CheckoutError(400,'Invalid payment request.');const body=adminJson(raw);
  if(typeof body.currency!=='string'||!/^[A-Z0-9]{2,10}$/.test(body.currency)||typeof body.network!=='string'||body.network.length>30)throw new CheckoutError(400,'Choose a valid payment method.');
  return checkoutReply(await checkoutBackend('/orders/'+code+'/payments',ip,{method:'POST',body:JSON.stringify({currency:body.currency,network:body.network})}));
 }
 if(request.method==='POST'&&segments.length===5&&segments[2]==='payments'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(segments[3])&&segments[4]==='tx'){
  const raw=await request.text();if(raw.length>2000)throw new CheckoutError(400,'Invalid transaction request.');const body=adminJson(raw);if(typeof body.txHash!=='string'||body.txHash.trim().length<20||body.txHash.length>120)throw new CheckoutError(400,'Enter the transaction hash from your wallet.');
  return checkoutReply(await checkoutBackend('/orders/'+code+'/payments/'+segments[3]+'/tx',ip,{method:'POST',body:JSON.stringify({txHash:body.txHash.trim()})}));
 }
 throw new CheckoutError(404,'This checkout action is unavailable.');
 }catch(error){return checkoutReply({error:error instanceof CheckoutError||error instanceof AdminError?error.message:'Checkout could not complete this request. Please try again.'},error instanceof CheckoutError||error instanceof AdminError?error.status:500);}}
export const GET=handle;export const POST=handle;
