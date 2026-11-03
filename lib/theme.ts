import type {Block,SiteDocument} from './document';

/** Brighten the previous shared palette once, retaining owner custom colours. */
export function brightenTheme(doc:SiteDocument){
 if((doc.themeVersion||0)>=1)return;
 const palette:Record<string,string>={
  '#5a1024':'#cf3049','#741d34':'#cf3049','#cf252c':'#cf3049',
  '#210b13':'#fff3f5','#2b1721':'#fff7f8','#2f1822':'#ffffff','#4d2e3c':'#f0dce2',
  '#e9e9ec':'#fff7f8','#e1e2e6':'#f0f8ff','#f1f1f3':'#ffffff','#d9dbdf':'#f1fbf7',
  '#eee5e8':'#fff0f3','#d9bdc6':'#f7cbd4','#f5f5f7':'#ffffff','#d4d6dc':'#ffe4ec',
  '#c2c4cc':'#ffe4ec','#c9cbd2':'#ffe4ec','#e6e7ec':'#fff7fa','#eeeef2':'#fff5f7',
  '#f3f3f6':'#fff9fa','#f4f4f7':'#ffffff','#d6d8df':'#ffe8ef','#d6d7dd':'#f1dfe5',
  '#d3d4dc':'#f1dfe5','#dedee4':'#f1dfe5','#dedee3':'#f1dfe5','#cfd0d7':'#f1dfe5',
  '#cdd2de':'#4c596d','#e3dbe0':'#4c596d','#ddb6c5':'#cf3049',
  '#9aa3b5':'#647084','#aab2c1':'#647084','#abb4c6':'#647084','#cdd3df':'#4c596d'
 };
 const recolor=(value:string|number)=>typeof value==='string'?value.replace(/#[a-f0-9]{6}(?![a-f0-9])/gi,c=>palette[c.toLowerCase()]||c):value;
 const walk=(node:Block,parentDark=false)=>{
  const dark=parentDark||/#(?:210b13|2b1721|2f1822)/i.test(String(node.style.background||''));
  const button=node.type==='link'&&!!node.style.background;
  node.style=Object.fromEntries(Object.entries(node.style).map(([key,value])=>[key,key==='boxShadow'?value:recolor(value)]));
  if(dark&&!button&&['white','#ffffff','#fff'].includes(String(node.style.color).toLowerCase()))node.style.color='#263248';
  if(node.mobile)node.mobile=Object.fromEntries(Object.entries(node.mobile).map(([key,value])=>[key,key==='boxShadow'?value:recolor(value)]));
  node.children?.forEach(child=>walk(child,dark));
 };
 doc.nodes.forEach(node=>walk(node));
 doc.themeVersion=1;
}
