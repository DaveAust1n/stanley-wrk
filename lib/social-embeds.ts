import type {Block} from './document';
export type SocialEmbed={url:string};
export type SocialTarget={url:string;provider:'instagram'|'youtube'|'tiktok'|'facebook'|'threads'|'website';embedUrl:string;note:string};
export function socialTarget(input:string):SocialTarget|null{
 const value=input.trim();if(!value||value.length>2000)return null;let u:URL;try{u=new URL(/^https?:\/\//i.test(value)?value:'https://'+value)}catch{return null}
 if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
 const host=u.hostname.toLowerCase().replace(/^www\./,'');
 if(!host.includes('.')||host==='localhost'||host.endsWith('.local')||host.endsWith('.internal')||host.endsWith('.test')||/^[\d.]+$/.test(host)||host.includes(':')||/^stanley-security-exercise(?:-[a-z0-9-]+)?\.vercel\.app$/.test(host))return null;
 const parts=u.pathname.split('/').filter(Boolean),base={url:u.href,provider:'website' as const,embedUrl:u.href,note:'Some websites block embedding. Use Open original if the page cannot load here.'};
 if(['youtube.com','m.youtube.com','youtu.be','youtube-nocookie.com'].includes(host)){
  const list=u.searchParams.get('list');const id=host==='youtu.be'?parts[0]:parts[0]==='watch'?u.searchParams.get('v'):['shorts','embed','live'].includes(parts[0])?parts[1]:null;
  if(id&&/^[\w-]{11}$/.test(id))return {url:'https://www.youtube.com/watch?v='+id,provider:'youtube',embedUrl:'https://www.youtube-nocookie.com/embed/'+id+(list&&/^[\w-]{10,100}$/.test(list)?'?list='+list:''),note:'Public videos play here when the owner allows embedding.'};
  if(list&&/^[\w-]{10,100}$/.test(list))return {url:'https://www.youtube.com/playlist?list='+list,provider:'youtube',embedUrl:'https://www.youtube-nocookie.com/embed/videoseries?list='+list,note:'Public playlist. Playback follows the playlist on YouTube.'};
  return {...base,provider:'youtube',embedUrl:'',note:'Paste a YouTube video, Short, live video or playlist URL to display a player. Channel links open on YouTube.'};
 }
 if(host==='instagram.com'){
  const post=['p','reel','tv'].includes(parts[0])&&/^[\w-]{3,100}$/.test(parts[1]||'')&&parts.length===2;
  const profile=parts.length===1&&/^[\w.]{1,30}$/.test(parts[0])&&!['accounts','direct','explore','about','developer','legal','privacy','reels','stories'].includes(parts[0]);
  const url=post?'https://www.instagram.com/'+parts[0]+'/'+parts[1]+'/':profile?'https://www.instagram.com/'+parts[0]+'/':u.href;
  return {...base,url,provider:'instagram',embedUrl:post||profile?'/api/social-embed?url='+encodeURIComponent(url):'',note:'Public Instagram posts, Reels and embeddable profiles are supported. The account owner must allow embedding.'};
 }
 if(host==='tiktok.com'){
  const id=parts[0]?.startsWith('@')&&parts[1]==='video'?parts[2]:parts[0]==='player'&&parts[1]==='v1'?parts[2]:null;
  return {...base,provider:'tiktok',embedUrl:id&&/^\d{15,25}$/.test(id)?'https://www.tiktok.com/player/v1/'+id:'',note:'Paste the full public TikTok video URL. Short share links and profile links open on TikTok.'};
 }
 if(['facebook.com','m.facebook.com'].includes(host)){
  const valid=(parts.length===3&&parts[1]==='posts'&&/^[\w-]+$/.test(parts[2]))||(parts.length===2&&parts[0]==='reel'&&/^\d+$/.test(parts[1]));const url='https://www.facebook.com/'+parts.join('/')+'/';return {...base,url,provider:'facebook',embedUrl:valid?'/api/social-embed?url='+encodeURIComponent(url):'',note:'Use a public Facebook post or Reel. Page and profile links open on Facebook.'};
 }
 if(['threads.com','threads.net'].includes(host)){
  const valid=(parts.length===3&&parts[0].startsWith('@')&&parts[1]==='post'&&/^[\w-]+$/.test(parts[2]))||(parts.length===2&&parts[0]==='t'&&/^[\w-]+$/.test(parts[1]));const url='https://www.threads.com/'+parts.join('/')+'/';return {...base,url,provider:'threads',embedUrl:valid?'/api/social-embed?url='+encodeURIComponent(url):'',note:'Public Threads posts are displayed using the official embed.'};
 }
 return base;
}
export function validSocial(value:unknown){return value===undefined||!!value&&typeof value==='object'&&!Array.isArray(value)&&typeof (value as SocialEmbed).url==='string'&&(value as SocialEmbed).url.length<=2000;}
export function prepareSocialSlots(nodes:Block[]){for(const n of nodes){if(n.type==='box'&&['Instagram','YouTube','Website'].includes(n.name)&&!n.social){const link=n.children?.find(c=>c.type==='link');if(link){n.social={url:link.href&&link.href!=='#'?link.href:''};n.style.padding=0;}}if(n.children)prepareSocialSlots(n.children);}}
const escape=(value:unknown)=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function socialMarkup(label:string,config:SocialEmbed,editing=false,origin=''){
 const target=socialTarget(config.url);const title=target?({instagram:'Instagram',youtube:'YouTube',tiktok:'TikTok',facebook:'Facebook',threads:'Threads',website:label||'Website'}[target.provider]):label;
 const frame=target?.embedUrl?(target.embedUrl.startsWith('/')?origin:'')+target.embedUrl:'';
 return `<section class="social-embed social-embed--${target?.provider||'empty'}"><header><span class="social-embed-symbol" aria-hidden="true">↗</span><h3>${escape(title)}</h3>${target?`<a href="${escape(target.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open original ${escape(title)}">Open original ↗</a>`:''}</header>${frame?`<div class="social-embed-frame${editing?' social-embed-editing':''}"><iframe title="${escape(title)} live content" src="${escape(frame)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen sandbox="allow-scripts${target!.provider==='website'||frame.includes('/api/social-embed?')?'':' allow-same-origin'} allow-popups allow-popups-to-escape-sandbox"></iframe>${editing?'<span class="social-embed-edit-note">Use Preview to interact</span>':''}</div>`:`<div class="social-embed-placeholder"><span aria-hidden="true">↗</span><strong>${target?'Open the original link':config.url.trim()?'Check this link':'Add your social link'}</strong><p>${escape(target?.note||(config.url.trim()?'Use a full public HTTPS link.':'Paste a link in Social links to display the content here.'))}</p></div>`}${target&&frame?`<p class="social-embed-hint">${escape(target.note)}</p>`:''}</section>`;
}
export const socialCss=`.social-embed{width:100%;min-width:0;color:#321c29;background:#fff;border-radius:inherit;overflow:hidden;text-align:start;font:13px/1.6 Arial,sans-serif;letter-spacing:normal}.social-embed>header{padding:19px 20px;display:flex;align-items:center;gap:9px;border-bottom:1px solid #f1e4e9;flex-wrap:wrap}.social-embed h3{font-size:16px;line-height:1.4;margin:0;font-weight:750}.social-embed-symbol{color:#d02e4b;font-size:22px}.social-embed>header a{margin-inline-start:auto;font-size:11px;color:#a73759;text-decoration:none}.social-embed-frame{position:relative;background:#faf7f9}.social-embed iframe{width:100%;height:520px;display:block;border:0;background:white}.social-embed--youtube iframe{height:auto;aspect-ratio:16/9;min-height:200px}.social-embed--website iframe{height:380px}.social-embed-editing iframe{pointer-events:none}.social-embed-edit-note{position:absolute;bottom:10px;inset-inline-end:10px;background:#fff;border:1px solid #e9d7e0;border-radius:6px;padding:4px 8px;color:#8c526a;font-size:10px;pointer-events:none}.social-embed-placeholder{min-height:220px;padding:25px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;gap:8px}.social-embed-placeholder>span{font-size:29px;color:#d02e4b}.social-embed-placeholder strong{font-size:14px}.social-embed-placeholder p,.social-embed-hint{font-size:11px;line-height:1.7;color:#8d7582;margin:0}.social-embed-hint{padding:13px 20px;border-top:1px solid #f1e4e9}.social-embed-placeholder p{max-width:290px}@media(max-width:600px){.social-embed>header{padding:16px}.social-embed iframe{height:500px}}`;
