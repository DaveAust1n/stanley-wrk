import Announcement from '../../components/studio/announcement';
import {loadDocument} from '../../lib/studio-storage';
import {initialDocument,type SiteDocument} from '../../lib/document';
import {documentHtml} from '../../lib/export';
export const dynamic='force-dynamic';
async function document(){return (await loadDocument('published.json')).document||initialDocument;}
export async function generateMetadata(){const d=await document();return {title:d.title,description:d.description};}
export default async function PublishedSite(){const d=await document();const html=documentHtml(d);return <><style>{html.css}</style><main dangerouslySetInnerHTML={{__html:html.body}}/><Announcement config={d.popup}/></>;}
