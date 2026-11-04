import CustomerPayment from '../../components/checkout/customer-payment';
import {checkoutLocale} from '../../lib/checkout-languages';
import {loadDocument} from '../../lib/studio-storage';
export const dynamic='force-dynamic';
export const metadata={title:'Checkout',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string|string[];order?:string}>}){const params=await searchParams;const {document}=await loadDocument('published.json');return <CustomerPayment code={typeof params.order==='string'?params.order:undefined} settings={document?.pageTemplates} locale={checkoutLocale(params.lang)}/>;}
