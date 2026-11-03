import type {Metadata} from 'next';
import OrderFlow from '../../components/order/order-flow';
import LanguageSwitcher from '../../components/studio/language-switcher';
import {loadDocument} from '../../lib/studio-storage';
import {checkoutLocale,checkoutLocales} from '../../lib/checkout-languages';
import {orderSettings,orderCopy,type OrderFormSettings} from '../../lib/order-form';
export const dynamic='force-dynamic';
type Props={searchParams:Promise<{lang?:string|string[];vehicle?:string|string[]}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata>{const locale=checkoutLocale((await searchParams).lang);return{title:orderCopy(orderSettings(),locale).title,robots:{index:false,follow:false}};}
export default async function OrderPage({searchParams}:Props){
 const query=await searchParams;const locale=checkoutLocale(query.lang);const vehicle=typeof query.vehicle==='string'?query.vehicle:undefined;let settings:OrderFormSettings|undefined;let unavailable=false;
 try{settings=(await loadDocument('published.json')).document?.orderForm}catch{unavailable=true;}
 return <div className="order-page"><style>{`.order-page .site-language-switcher{position:fixed;bottom:16px;left:18px;z-index:30;display:flex;gap:8px;align-items:center;padding:10px 13px;border:1px solid #dfc9d9;border-radius:10px;background:white;color:#804662;font-size:12px;box-shadow:0 4px 18px #4a163014}.order-page .site-language-switcher select{border:0;background:transparent;font:inherit;color:inherit;max-width:145px}.order-page .order-flow{padding-bottom:90px}`}</style>{unavailable&&<p role="alert" style={{margin:0,padding:'12px 24px',background:'#f2e7ed',color:'#79536b',fontSize:12}}>Saved form settings could not be loaded. Default placeholders are shown.</p>}<OrderFlow settings={settings} locale={locale} initialVehicleId={vehicle}/><LanguageSwitcher languages={[...checkoutLocales]} selected={locale}/></div>;
}
