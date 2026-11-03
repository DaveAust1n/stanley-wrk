import type {Block,SiteDocument} from './document';

/** Resolve old section slugs without replacing saved block IDs or custom links. */
export function connectSectionLinks(nodes:Block[]){
 const all:Block[]=[];
 const visit=(items:Block[])=>{for(const item of items){if(item.hidden)continue;all.push(item);visit(item.children||[]);}};
 visit(nodes);
 const ids=new Set(all.map(n=>n.id));
 const aliases:Record<string,string>={home:'Hero',overview:'Overview',stories:'Video story 1',process:'Process',collection:'Collection'};
 const targets=new Map<string,string>();
 for(const [slug,name] of Object.entries(aliases)){
  const section=all.find(n=>n.type==='box'&&n.name===name);
  if(section&&!ids.has(slug))targets.set('#'+slug,'#'+section.id);
 }
 for(const n of all)if(n.type==='link'&&n.href&&targets.has(n.href))n.href=targets.get(n.href)!;
}

/** Migrate placeholder CTAs once; later edits to destinations remain the owner's. */
export function connectTemplatePages(doc:SiteDocument){
 if((doc.navigationVersion||0)>=1)return;
 const vehicles=doc.orderForm?.vehicles||Array.from({length:9},(_,i)=>({id:`vehicle-${i+1}`}));
 const clean=(s:string)=>s.replace(/[→↗]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
 const walk=(nodes:Block[],card?:number)=>{for(const n of nodes){
  const match=/^(?:Overview card|Collection item) (\d+)$/.exec(n.name);
  const index=match?Number(match[1])-1:card;
  if(n.type==='link'){
   const label=clean(n.text||n.name);
   if(n.href?.startsWith('#')){
    if(['explore now','explore collection'].includes(label))n.href='/order';
    else if(index!==undefined&&['explore','view details'].includes(label))n.href='/order?vehicle='+encodeURIComponent(vehicles[index]?.id||vehicles[0].id);
   }
  }
  if(n.children)walk(n.children,index);
 }};
 walk(doc.nodes);
 const all:Block[]=[];const collect=(ns:Block[])=>{for(const n of ns){all.push(n);collect(n.children||[]);}};collect(doc.nodes);
 const nav=all.find(n=>n.name==='Navigation links');
 if(nav?.children&&!nav.children.some(n=>n.href==='/track')){
  const sample=nav.children.find(n=>n.type==='link'&&!n.style.background);
  if(sample&&!all.some(n=>n.id==='nav-track-order'))nav.children.splice(Math.max(0,nav.children.length-1),0,{...sample,id:'nav-track-order',name:'Track order',text:'Track order',href:'/track',style:{...sample.style}});
 }
 doc.navigationVersion=1;
}
