import Announcement from '../../components/studio/announcement';
import LanguageSwitcher from '../../components/studio/language-switcher';
import {loadDocument} from '../../lib/studio-storage';
import {initialDocument} from '../../lib/document';
import {prepareDocument} from '../../lib/design';
import {enabledLanguages,localizedDocument,languageInfo,type Locale} from '../../lib/languages';
import {documentHtml} from '../../lib/export';
export const dynamic='force-dynamic';
type PageProps={searchParams:Promise<{lang?:string|string[]}>};
async function pageData(params:PageProps['searchParams']){const [stored,query]=await Promise.all([loadDocument('published.json'),params]);const source=prepareDocument(stored.document||initialDocument);const languages=enabledLanguages(source);const code=typeof query.lang==='string'&&languages.includes(query.lang as Locale)?query.lang as Locale:'en';return{source,languages,code,document:localizedDocument(source,code)}}
export async function generateMetadata({searchParams}:PageProps){const {document}=await pageData(searchParams);return{title:document.title,description:document.description};}
export default async function PublishedSite({searchParams}:PageProps){const {languages,code,document}=await pageData(searchParams);const html=documentHtml(document);return <div className="public-site" lang={code} dir={languageInfo(code).dir}><style>{html.css}</style><main dangerouslySetInnerHTML={{__html:html.body}}/><Announcement config={document.popup}/><LanguageSwitcher languages={languages} selected={code}/></div>;}
