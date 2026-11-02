// Authenticated bridge for this owner-private Metro Visual Studio project.
// The token lives only in the Site's secret environment. This is its SHA-256 digest.
const EXPECTED_TOKEN_HASHES = ["9b5a7186fdd2381cd217b2ea690d948b5ee30740c95a0aa9ba1162c49652113c","f2f5919615b0e0c84a16bbe26e85f393cb9f051f93954c8194fb651525cfdb2a"];
const SITE_ID = "appgprj_6ae8a63c83d48191aca6901f3ac533b3";
const BUCKET = "metro-studio-media";
const BASE = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const json = (data: unknown,status=200) => Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
async function api(path:string,init:RequestInit={}) {
  return fetch(BASE+path,{...init,headers:{apikey:SERVICE_KEY,Authorization:"Bearer "+SERVICE_KEY,...init.headers}});
}
async function checked(path:string,init:RequestInit={}) {
  const r=await api(path,init);
  if(!r.ok){console.error("Storage/database request failed",r.status,path.split("?")[0]);throw new Error("Backend request failed");}
  return r;
}
function tableQuery(extra:Record<string,string>) {
  const q=new URLSearchParams({site_id:"eq."+SITE_ID,...extra});
  return "/rest/v1/metro_studio_documents?"+q;
}
function documentKey(key:string){return key==="draft.json"||key==="published.json"||/^versions\/[a-zA-Z0-9-]+\.json$/.test(key);}
Deno.serve(async(req:Request)=>{
 try {
  const token=req.headers.get("x-studio-key")||"";
  if(!token)return json({error:"Unauthorized"},401);
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token))),n=>n.toString(16).padStart(2,"0")).join("");
  const valid=EXPECTED_TOKEN_HASHES.some(expected=>{
   let diff=digest.length^expected.length;
   for(let i=0;i<digest.length;i++)diff|=digest.charCodeAt(i)^expected.charCodeAt(i);
   return diff===0;
  });
  if(!valid)return json({error:"Unauthorized"},401);
  const url=new URL(req.url),path=url.pathname.split("/metro-studio-backend")[1]||"/";
  if(path==="/health"&&req.method==="GET"){await checked(tableQuery({select:"key",limit:"1"}));await checked("/storage/v1/bucket/"+BUCKET);return json({ok:true,project:"olnkypwqreonuweulylk"});}
  if(path==="/versions"&&req.method==="GET"){
   const rows=await(await checked(tableQuery({select:"key,updated_at",key:"like.versions/%",order:"updated_at.desc",limit:"30"}))).json();
   return json({versions:rows.map((r:{key:string;updated_at:string})=>({key:r.key,date:r.updated_at}))});
  }
  if(path==="/document"&&req.method==="GET"){
   const key=url.searchParams.get("key")||"draft.json";if(!documentKey(key))return json({error:"Invalid document key"},400);
   const rows=await(await checked(tableQuery({key:"eq."+key,select:"document,updated_at",limit:"1"}))).json();
   return json({document:rows[0]?.document||null,savedAt:rows[0]?.updated_at||null});
  }
  if(path==="/document"&&req.method==="POST"){
   const raw=await req.text();if(raw.length>2000000)return json({error:"Document too large"},413);
   const p=JSON.parse(raw);
   if(!p.document||typeof p.document.title!=="string"||!Array.isArray(p.document.nodes)||!["save","publish","import"].includes(p.action))return json({error:"Invalid document"},400);
   if(p.action==="publish"){
    const r=await checked("/rest/v1/rpc/metro_studio_publish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({p_site_id:SITE_ID,p_document:p.document})});
    return json({savedAt:new Date().toISOString(),versionKey:await r.json()});
   }
   const key=p.action==="import"?p.key:"draft.json";
   if(typeof key!=="string"||!documentKey(key))return json({error:"Invalid document key"},400);
   const time=p.action==="import"&&typeof p.savedAt==="string"&&Number.isFinite(Date.parse(p.savedAt))?p.savedAt:new Date().toISOString();
   await checked("/rest/v1/metro_studio_documents?on_conflict=site_id,key",{method:"POST",headers:{"Content-Type":"application/json",Prefer:(p.action==="import"?"resolution=ignore-duplicates":"resolution=merge-duplicates")+",return=minimal"},body:JSON.stringify({site_id:SITE_ID,key,document:p.document,updated_at:time})});
   return json({savedAt:time});
  }
  const match=/^\/assets\/([a-f0-9-]{36})$/.exec(path);
  if(match){
   const objectPath=BUCKET+"/"+SITE_ID+"/"+match[1];
   if(req.method==="PUT"){
    const type=req.headers.get("Content-Type")||"";
    if(!["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm"].includes(type))return json({error:"Unsupported media"},400);
    if(Number(req.headers.get("Content-Length"))>8388608)return json({error:"File too large"},413);
    const body=await req.arrayBuffer();if(body.byteLength>8388608)return json({error:"File too large"},413);
    const r=await api("/storage/v1/object/"+objectPath,{method:"POST",headers:{"Content-Type":type,"x-upsert":"true"},body});
    if(!r.ok)throw new Error("Unable to store media");
    return json({key:match[1]});
   }
   if(req.method==="GET"){
    const r=await api("/storage/v1/object/authenticated/"+objectPath);
    if(!r.ok){const detail=await r.clone().json().catch(()=>({}));if(r.status===404||Number(detail.statusCode)===404||detail.error==="not_found")return json({error:"Not found"},404);throw new Error("Unable to read media");}
    return new Response(r.body,{headers:{"Content-Type":r.headers.get("Content-Type")||"application/octet-stream","Cache-Control":"private, max-age=86400","X-Content-Type-Options":"nosniff"}});
   }
  }
  return json({error:"Not found"},404);
 } catch(error) {console.error(error instanceof Error?error.message:"Unexpected backend error");return json({error:"Backend request failed. Please retry."},500);}
});

