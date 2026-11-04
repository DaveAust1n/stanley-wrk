import {cookies} from 'next/headers';
import {getIronSession} from 'iron-session';
import {CheckoutError} from './customer-contract';
export type CustomerSession={orders?:string[];lastRequest?:{id:string;fingerprint:string;code:string}};
export async function customerSession(){const password=process.env.CUSTOMER_SESSION_SECRET;if(!password||password.length<32)throw new CheckoutError(503,'Checkout is temporarily unavailable. Please try again later.');return getIronSession<CustomerSession>(await cookies(),{password,cookieName:'stanley_customer_orders',ttl:86400,cookieOptions:{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/'}});}
export function ownsOrder(session:CustomerSession,code:string){return /^ORD-[A-F0-9]{12}$/.test(code)&&!!session.orders?.includes(code);}
