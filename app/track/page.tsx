import TemplatePageView from '../../components/checkout/template-page';
import {checkoutLocale} from '../../lib/checkout-languages';
import {loadDocument} from '../../lib/studio-storage';
export const dynamic='force-dynamic';
export const metadata={title:'Track your order',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string|string[];code?:string}>}){
 const params=await searchParams;const locale=checkoutLocale(params.lang);
 const {document}=await loadDocument('published.json');
 return <TemplatePageView page="track" settings={document?.pageTemplates} locale={locale} preview={false} initialCode={typeof params.code==='string'?params.code:undefined}/>;
}
