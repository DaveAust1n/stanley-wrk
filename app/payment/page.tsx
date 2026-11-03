import TemplatePageView from '../../components/checkout/template-page';
import {checkoutLocale} from '../../lib/checkout-languages';
import {loadDocument} from '../../lib/studio-storage';
export const dynamic='force-dynamic';
export const metadata={title:'Checkout template',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string|string[]}>}){
 const locale=checkoutLocale((await searchParams).lang);
 const {document}=await loadDocument('published.json');
 return <TemplatePageView page="payment" settings={document?.pageTemplates} locale={locale}/>;
}
