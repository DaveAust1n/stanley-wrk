import type {Block,SiteDocument} from './document';
import {enabledLanguages,seedLanguage} from './languages';
const replacements:Record<string,string>={'#df252a':'#5a1024','#cf252c':'#5a1024','#cc242b':'#5a1024','#c42c33':'#741d34','#0e121e':'#210b13','#111723':'#19191d','#121723':'#19191d','#fff0f0':'#e9e9ec','#edf4ff':'#e1e2e6','#f5f6f8':'#f1f1f3','#edfcf1':'#d9dbdf','#fff2f2':'#eee5e8','#f2d5d6':'#d9bdc6','#fff4f3':'#f5f5f7','#ffe4e5':'#d4d6dc','#f8fafc':'#f9f9fa','#e8edf3':'#d6d8df','#161d2b':'#2b1721','#171d2c':'#2f1822','#2a3141':'#4d2e3c','#252d40':'#4d2e3c'};
const recolor=(v:string|number)=>typeof v==='string'?v.replace(/#[a-f0-9]{6}/gi,c=>replacements[c.toLowerCase()]||c):v;
export function prepareDocument(input:SiteDocument):SiteDocument{const doc=JSON.parse(JSON.stringify(input)) as SiteDocument;if((doc.designVersion??0)<2){const walk=(n:Block)=>{n.style=Object.fromEntries(Object.entries(n.style).map(([k,v])=>[k,recolor(v)]));if(n.mobile)n.mobile=Object.fromEntries(Object.entries(n.mobile).map(([k,v])=>[k,recolor(v)]));n.children?.forEach(walk);};doc.nodes.forEach(walk);if(doc.popup){doc.popup.accent=String(recolor(doc.popup.accent));doc.popup.background=String(recolor(doc.popup.background));}const hero=doc.nodes.find(n=>n.name==='Hero');if(hero){hero.style.padding='110px 4.5% 72px';hero.style.minHeight='calc(100vh - 112px)';hero.mobile={...hero.mobile,padding:'48px 22px'};}const refine=(n:Block)=>{if(n.name==='Navigation')Object.assign(n.style,{position:'sticky',top:0,zIndex:20,padding:'18px 4.5%'});if(n.name==='Hero layout')n.style.maxWidth=1240;if(n.name==='Hero columns')n.style.gap=64;if(n.name==='Hero visual')Object.assign(n.style,{background:'linear-gradient(140deg,#f8f8fa,#c9cbd2 60%,#e9e9ed)',boxShadow:'0 18px 46px #210b1315'});if(n.name==='Featured image'){n.style.height=548;n.mobile={...n.mobile,height:340};}if(n.tag==='h1'||n.tag==='h2'){if(Number(n.style.fontSize)===64){n.style.fontSize=72;n.mobile={...n.mobile,fontSize:44};}}n.children?.forEach(refine);};doc.nodes.forEach(refine);doc.designVersion=2;}if((doc.designVersion??0)<3){refineLayout(doc);doc.designVersion=3;}if((doc.designVersion??0)<4){reserveLogoSpace(doc);doc.designVersion=4;}doc.languages=enabledLanguages(doc);if(doc.i18nVersion!==1){for(const locale of doc.languages)seedLanguage(doc,locale);doc.i18nVersion=1;}return doc;}

/** Apply the shared layout once, retaining IDs, copy, uploads and translations. */
function refineLayout(doc:SiteDocument){
 const sections=new Set(['Hero','Overview','Video story 1','Video story 2','Editorial cards','Quote spotlight','Social links','Process','Collection','Updates','Footer']);
 const surfaces=new Set(['Editorial card 1','Editorial card 2','Instagram','YouTube','Website']);
 const walk=(n:Block,inDark=false)=>{
  const dark=inDark||n.name==='Video story 1'||n.name==='Footer';
  if(dark&&n.type==='text'&&['#5a1024','#741d34'].includes(String(n.style.color)))n.style.color='#ddb6c5';
  if(n.type==='box'&&sections.has(n.name)){Object.assign(n.style,{padding:'88px 5%'});n.mobile={...n.mobile,padding:'48px 20px'};}
  if(n.name.endsWith(' content')||n.name==='Hero layout')Object.assign(n.style,{maxWidth:1180,width:'100%',margin:'0 auto'});
  if(n.name==='Top information strip')Object.assign(n.style,{background:'#210b13',color:'#e3dbe0',padding:'11px 24px',fontSize:11,gap:40});
  if(n.name==='Navigation'){Object.assign(n.style,{padding:'18px max(24px,calc((100vw - 1180px)/2))',minHeight:84,boxShadow:'0 3px 16px #210b1308',borderBottom:'1px solid #dedee3'});n.mobile={...n.mobile,padding:'18px 20px',gap:16};}
  if(n.name==='Navigation links')n.mobile={...n.mobile,gap:16,fontSize:12};
  if(n.name==='Hero'){Object.assign(n.style,{padding:'68px 5% 76px',minHeight:0,background:'linear-gradient(120deg,#fff 42%,#f0f0f3)'});n.mobile={...n.mobile,padding:'40px 20px 48px'};}
  if(n.name==='Hero columns')Object.assign(n.style,{gap:56,alignItems:'center'});
  if(n.name==='Hero copy')Object.assign(n.style,{flex:'1 1 0',minWidth:0});
  if(n.name==='Hero visual'){Object.assign(n.style,{flex:'1 1 0',minWidth:0,padding:20,border:'1px solid #cfd0d7',borderRadius:24,background:'linear-gradient(140deg,#f8f8fa,#c2c4cc 65%,#e6e7ec)',boxShadow:'0 22px 54px #210b1312'});n.mobile={...n.mobile,padding:16};}
  if(n.name==='Featured image'){Object.assign(n.style,{height:360,borderRadius:16});n.mobile={...n.mobile,height:260};}
  if(n.tag==='h1'||n.tag==='h2'){if(Number(n.style.fontSize)>=64)Object.assign(n.style,{fontSize:58,lineHeight:1.08,letterSpacing:-2.3});n.mobile={...n.mobile,fontSize:36,letterSpacing:-1.2};}
  if(n.name==='Section heading')Object.assign(n.style,{marginBottom:18,maxWidth:800,marginLeft:'auto',marginRight:'auto',lineHeight:1.15});
  if(n.name==='Four column grid'){Object.assign(n.style,{gap:20,alignItems:'stretch'});n.mobile={...n.mobile,gridTemplateColumns:'minmax(0,1fr)',gap:18};}
  if(/^Overview card \d+$/.test(n.name)){Object.assign(n.style,{padding:22,borderRadius:18,border:'1px solid #d6d7dd',background:'linear-gradient(145deg,#fbfbfc,#e1e2e7)',boxShadow:'0 8px 24px #210b1309',display:'flex',flexDirection:'column',alignItems:'stretch'});n.mobile={...n.mobile,padding:24};}
  if(/^Image 0\d$/.test(n.name))Object.assign(n.style,{height:170,borderRadius:12});
  if(n.name==='Video story 1')Object.assign(n.style,{background:'#210b13'});
  if(/^Video \d card$/.test(n.name))Object.assign(n.style,{maxWidth:920,borderRadius:20,boxShadow:'0 16px 48px #10040b18'});
  if(n.name==='Video caption'){Object.assign(n.style,{padding:'22px 26px'});n.mobile={...n.mobile,padding:20,gap:12};}
  if(n.name==='Notes'){Object.assign(n.style,{padding:'0 22px 10px'});n.mobile={...n.mobile,padding:'0 12px 8px'};}
  if(n.type==='box'&&surfaces.has(n.name))Object.assign(n.style,{border:'1px solid #d6d7dd',borderRadius:18,background:'linear-gradient(145deg,#fff,#f3f3f6)',boxShadow:'0 8px 26px #210b1307'});
  if(n.type==='box'&&(n.name==='Editorial cards'||n.name==='Collection'))n.style.background='#f3f3f6';
  if(n.name==='Quote card')Object.assign(n.style,{maxWidth:900,margin:'0 auto',padding:'48px 40px',background:'#eeeef2',border:'1px solid #d6d7dd',borderRadius:20});
  if(n.name==='Steps grid')n.mobile={...n.mobile,gridTemplateColumns:'minmax(0,1fr)'};
  if(/^Step \d$/.test(n.name))Object.assign(n.style,{border:'1px solid #dedee4',background:'#f4f4f7',padding:28});
  if(/^Collection item \d+$/.test(n.name)){Object.assign(n.style,{padding:24,borderRadius:18,border:'1px solid #d3d4dc',boxShadow:'0 8px 24px #210b1308',display:'flex',flexDirection:'column',alignItems:'stretch'});n.mobile={...n.mobile,padding:22};}
  if(n.name==='Collection grid')Object.assign(n.style,{gap:24,alignItems:'stretch'});
  if(n.name==='Item details')Object.assign(n.style,{margin:'12px 0 18px',borderTop:'1px solid #e2e2e7',borderBottom:'1px solid #e2e2e7',gap:12});
  if(n.name==='Updates list')Object.assign(n.style,{overflow:'hidden',border:'1px solid #d6d7dd',borderRadius:18,background:'#fafafb'});
  if(n.name==='Footer')Object.assign(n.style,{background:'#210b13',padding:'64px 5% 36px'});
  if(n.type==='link'&&n.style.background==='#5a1024')Object.assign(n.style,{boxShadow:'0 4px 12px #5a102418',textAlign:'center'});
  n.children?.forEach(child=>walk(child,dark));
 };
 doc.nodes.forEach(node=>walk(node));
}

/** Reserve an editable image slot without replacing the existing brand wording. */
function reserveLogoSpace(doc:SiteDocument){
 const all:Block[]=[];
 const visit=(nodes:Block[])=>{for(const n of nodes){all.push(n);if(n.children)visit(n.children);}};visit(doc.nodes);
 const nav=all.find(n=>n.name==='Navigation'&&n.type==='box');
 if(!nav||!nav.children||all.some(n=>n.name==='Header logo'))return;
 const used=new Set(all.map(n=>n.id));
 const id=(base:string)=>{let next=base,i=1;while(used.has(next))next=base+'-'+i++;used.add(next);return next;};
 const logo:Block={id:id('header-logo'),name:'Header logo',type:'image',src:'',text:'Logo',style:{width:120,height:48,objectFit:'contain',flexShrink:0},mobile:{width:104,height:44}};
 const first=nav.children[0];
 if(first?.type==='text'){
  nav.children=[{id:id('header-brand'),name:'Header brand',type:'box',style:{display:'flex',alignItems:'center',gap:14,flexShrink:0},children:[logo,first]},...nav.children.slice(1)];
 }else nav.children.unshift(logo);
}
