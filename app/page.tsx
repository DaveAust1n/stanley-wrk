import {redirect} from 'next/navigation';
import PublishedSite from './site/page';
export {generateMetadata} from './site/page';
export const dynamic='force-dynamic';
type Props={searchParams:Promise<{lang?:string|string[];panel?:string|string[]}>};
export default async function Page({searchParams}:Props){
 const query=await searchParams;
 if(query.panel==='order')redirect('/editor?panel=order');
 return <PublishedSite searchParams={Promise.resolve(query)}/>;
}
