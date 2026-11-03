export type TemplatePage='payment'|'track';
export type TemplateCopy={title:string;intro:string;heading:string;body:string;sideTitle:string;sideBody:string};
export type PageTemplates=Partial<Record<TemplatePage,Record<string,Partial<TemplateCopy>>>>;
export const templateFields=['title','intro','heading','body','sideTitle','sideBody'] as const;
export function templateCopy(settings:PageTemplates|undefined,page:TemplatePage,locale='en'):TemplateCopy{
 return {title:page==='payment'?'Checkout':'Track order',intro:'',heading:page==='payment'?'Payment details':'Order reference',body:'',sideTitle:'Your information',sideBody:'',...settings?.[page]?.en,...settings?.[page]?.[locale]};
}
export function validPageTemplates(value:unknown):boolean{
 if(value===undefined)return true;
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 return Object.entries(value).every(([page,languages])=>['payment','track'].includes(page)&&languages&&typeof languages==='object'&&!Array.isArray(languages)&&Object.keys(languages).length<=20&&Object.entries(languages).every(([locale,copy])=>/^[a-z]{2,3}$/.test(locale)&&copy&&typeof copy==='object'&&!Array.isArray(copy)&&Object.entries(copy).every(([field,text])=>templateFields.includes(field as keyof TemplateCopy)&&typeof text==='string'&&text.length<=2000)));
}
