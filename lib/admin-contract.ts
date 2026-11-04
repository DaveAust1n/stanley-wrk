export const paymentStatuses=['submitted','awaiting','confirmed','rejected','expired'] as const;
export type PaymentStatus=typeof paymentStatuses[number];
export const fulfilmentStatuses=['processing','preparing','in_transit','delivered'] as const;
export type FulfilmentStatus=typeof fulfilmentStatuses[number];
export type AdminPayment={id:string;orderCode:string;orderStatus:string;vehicleName:string;totalUsd:number;customerName:string;customerEmail:string;customerPhone:string;currency:string;network:string;walletAddress:string;rateUsd:number;expectedAmount:number;txHash:string|null;status:PaymentStatus;submittedAt:string|null;expiresAt:string;submittedAfterExpiry:boolean;adminNote:string|null};
export type AdminOrder={code:string;status:string;trackingCode:string|null;vehicleName:string;deliveryName:string;vehiclePrice:number;deliveryFee:number;deliveryPrice:number;totalUsd:number;fulfilmentStatus:FulfilmentStatus;fulfilmentNote:string|null;customer?:{address:string;city:string;country:string;postcode:string|null}};
export class AdminError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');const host=request.headers.get('host')||new URL(request.url).host;let allowed=false;try{const parsed=new URL(origin||'');allowed=parsed.origin===origin&&parsed.host===host&&(parsed.protocol==='https:'||(parsed.protocol==='http:'&&['localhost','127.0.0.1'].includes(parsed.hostname)));}catch{}if(!allowed)throw new AdminError(403,'This request was blocked. Refresh the page and try again.');}
export function adminDestination(segments:string[],method:string,status:string|null){
 const path=segments.join('/');
 if(method==='GET'&&path==='payments'){if(!paymentStatuses.includes(status as PaymentStatus))throw new AdminError(400,'Choose a valid payment status.');return '/admin/payments?status='+status;}
 if(method==='GET'&&/^orders\/ORD-[A-F0-9]{12}$/.test(path))return '/admin/'+path;
 if(method==='POST'&&/^payments\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/(confirm|reject)$/.test(path))return '/admin/'+path;
 if(method==='POST'&&/^orders\/ORD-[A-F0-9]{12}\/fulfilment$/.test(path))return '/admin/'+path;
 throw new AdminError(404,'This admin action is unavailable.');
}
export function adminCommand(path:string,body:unknown){
 if(!body||typeof body!=='object'||Array.isArray(body))throw new AdminError(400,'Invalid request.');
 const input=body as Record<string,unknown>;
 const note=typeof input.note==='string'?input.note.trim():'';
 if(note.length>500)throw new AdminError(400,'Keep the note under 500 characters.');
 if(path.endsWith('/confirm')){if(input.verifiedReceipt!==true)throw new AdminError(400,'Verify receipt of the payment before confirming.');return {note:note||null};}
 if(path.endsWith('/reject')){if(!note)throw new AdminError(400,'Enter a reason for rejecting this payment.');return {note};}
 if(!fulfilmentStatuses.includes(input.status as FulfilmentStatus))throw new AdminError(400,'Choose a valid delivery status.');
 return {status:input.status,note:note||null};
}

export function adminJson(raw:string):Record<string,unknown>{let value:unknown;try{value=JSON.parse(raw);}catch{throw new AdminError(400,'Invalid JSON request.');}if(!value||typeof value!=='object'||Array.isArray(value))throw new AdminError(400,'Invalid request.');return value as Record<string,unknown>;}
