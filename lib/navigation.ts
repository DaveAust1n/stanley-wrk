import type {Block} from './document';

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
