import {prepareDocument} from './design';
import {initialDocument,type SiteDocument} from './document';
export type StoredDocument={document:SiteDocument|null;savedAt:string|null};
function config(){const url=process.env.STUDIO_BACKEND_URL;const token=process.env.STUDIO_BACKEND_TOKEN;if(!url||!token)throw new Error('Backend configuration is incomplete.');return {url:url.replace(/\/$/,''),token};}
export function storageBackend(){return 'supabase';}
async function remote(path:string,init:RequestInit={},allowMissing=false){const c=config();const response=await fetch(c.url+path,{...init,headers:{...init.headers,'x-studio-key':c.token},cache:'no-store',signal:AbortSignal.timeout(20000)});if(!response.ok&&!(allowMissing&&response.status===404)){console.error('Studio backend error',response.status,path.split('?')[0]);throw new Error('Unable to reach saved website data. Please retry.');}return response;}
async function sendDocument(document:SiteDocument,action:string,key?:string){return(await remote('/document',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({document,action,key})})).json() as Promise<{savedAt:string}>;}
export async function loadDocument(key:string):Promise<StoredDocument>{const data=await(await remote('/document?key='+encodeURIComponent(key))).json() as StoredDocument;if(data.document)return {...data,document:prepareDocument(data.document)};if(key!=='draft.json'&&key!=='published.json')return data;await sendDocument(initialDocument,'import',key);return{document:prepareDocument(initialDocument),savedAt:null};}
export async function listVersions(){return(await(await remote('/versions')).json() as {versions:{key:string;date:string}[]}).versions;}
export async function saveDocument(document:SiteDocument,action:'save'|'publish'){return sendDocument(document,action);}
export async function saveAsset(key:string,body:ArrayBuffer,type:string){await remote('/assets/'+key,{method:'PUT',headers:{'Content-Type':type},body});}
export async function loadAsset(key:string){const saved=await remote('/assets/'+key,{},true);if(!saved.ok)return new Response('Not found',{status:404});return new Response(saved.body,{headers:{'Content-Type':saved.headers.get('Content-Type')||'application/octet-stream','Cache-Control':'private, max-age=86400','X-Content-Type-Options':'nosniff'}});}
export async function checkBackend(){return {...await(await remote('/health')).json() as {ok:boolean;project:string},backend:'supabase'};}
