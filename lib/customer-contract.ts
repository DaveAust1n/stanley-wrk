import type {OrderFormSettings} from './order-form';
export type CustomerDetails={name:string;email:string;phone:string;address:string;city:string;country:string;postcode:string};
export type CustomerPayment={id:string;currency:string;network:string;walletAddress:string;rateUsd:number;expectedAmount:number;txHash:string|null;status:'awaiting'|'submitted'|'confirmed'|'rejected'|'expired';expiresAt:string;secondsRemaining:number|null;note?:string|null};
export type CustomerOrder={code:string;status:'awaiting_payment'|'payment_submitted'|'paid';vehicleName:string;deliveryName:string;vehiclePrice:number;deliveryFee:number;deliveryPrice:number;totalUsd:number;createdAt:string;trackingCode:string|null;payments:CustomerPayment[];options:{currency:string;network:string;isStable:boolean}[]};
export type TrackingResult={code:string|null;status:string;paymentStatus:string|null;vehicleName:string;deliveryName:string;fulfilmentStatus:string|null;fulfilmentNote:string|null;trackingCode:string|null;createdAt:string;paidAt:string|null};
export class CheckoutError extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
const text=(value:unknown,min:number,max:number)=>typeof value==='string'&&value.trim().length>=min&&value.trim().length<=max;
const price=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100000000;
export function pricedOrder(settings:OrderFormSettings|undefined,body:Record<string,unknown>){
 if(['vehiclePrice','deliveryFee','deliveryPrice','total','totalUsd','walletAddress','status'].some(key=>key in body))throw new CheckoutError(400,'Prices and payment status are set by the server.');
 if(typeof body.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(body.requestId))throw new CheckoutError(400,'Refresh the order form and try again.');
 const customer=body.customer as Record<string,unknown>|undefined;
 if(!customer||!text(customer.name,1,150)||!text(customer.email,3,150)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customer.email).trim())||!text(customer.phone,5,40)||!text(customer.address,3,300)||!text(customer.city,1,150)||!text(customer.country,1,150)||(customer.postcode!==undefined&&customer.postcode!==''&&!text(customer.postcode,1,40)))throw new CheckoutError(400,'Check your name, email, phone and delivery address.');
 if(!settings||!Array.isArray(settings.vehicles)||!Array.isArray(settings.deliveryOptions))throw new CheckoutError(503,'Vehicle and delivery prices have not been published yet.');
 const vehicle=settings.vehicles.find(v=>v.id===body.vehicleId),delivery=settings.deliveryOptions.find(d=>d.id===body.deliveryId);
 if(!vehicle||!delivery)throw new CheckoutError(400,'Choose an available vehicle and delivery option.');
 if(!price(vehicle.price)||!price(settings.deliveryFee)||!price(delivery.price))throw new CheckoutError(503,'A price is still missing for this selection. Choose another option or contact the business.');
 const cents=(value:number)=>Math.round(value*100);
 const total=(cents(vehicle.price!)+cents(settings.deliveryFee!)+cents(delivery.price!))/100;
 if(total<=0||total>100000000)throw new CheckoutError(400,'This selection does not have a valid payable total.');
 if(!price(body.expectedTotal)||cents(body.expectedTotal as number)!==cents(total))throw new CheckoutError(409,'Prices have changed. Review the updated total before continuing.');
 const locale=typeof body.locale==='string'&&/^[a-z]{2,3}$/.test(body.locale)?body.locale:'en';
 const clean=Object.fromEntries(['name','email','phone','address','city','country','postcode'].map(key=>[key,String(customer[key]||'').trim()]));clean.email=clean.email.toLowerCase();
 return {vehicleId:vehicle.id,vehicleName:vehicle.name||'Vehicle',deliveryId:delivery.id,deliveryName:delivery.name||({standard:'Standard delivery',express:'Express delivery',premium:'Premium delivery'}[delivery.id]||'Delivery'),vehiclePrice:cents(vehicle.price!)/100,deliveryFee:cents(settings.deliveryFee!)/100,deliveryPrice:cents(delivery.price!)/100,total,customer:clean,locale};
}
export function paymentUri(payment:Pick<CustomerPayment,'currency'|'network'|'walletAddress'|'expectedAmount'>){return payment.currency==='DOGE'&&payment.network==='Dogecoin'?'dogecoin:'+payment.walletAddress+'?amount='+Number(payment.expectedAmount).toFixed(8):payment.walletAddress;}
