import test from 'node:test';
import assert from 'node:assert/strict';
import {connectSectionLinks,connectTemplatePages} from '../lib/navigation.ts';
const block=(id,name,extra={})=>({id,name,type:'box',style:{},...extra});
test('saved section IDs work with older navigation and CTA links',()=>{
 const nodes=[block('element-63','Overview'),block('element-85','Video story 1'),block('element-174','Process'),block('element-271','Collection'),
  block('nav','Navigation',{children:['overview','stories','process','collection'].map(slug=>block('link-'+slug,slug,{type:'link',href:'#'+slug}))})];
 connectSectionLinks(nodes);
 assert.deepEqual(nodes.at(-1).children.map(n=>n.href),['#element-63','#element-85','#element-174','#element-271']);
 assert.equal(nodes[0].id,'element-63');
});
test('primary CTA and vehicle cards open pages and preserve the selected vehicle',()=>{
 const doc={nodes:[block('nav','Navigation links',{children:[block('cta','Explore now',{type:'link',text:'Explore now',href:'#collection'})]}),block('card','Collection item 2',{children:[block('card-cta','View details',{type:'link',text:'View details →',href:'#collection'})]})],orderForm:{vehicles:[{id:'first'},{id:'second'}]}};
 connectTemplatePages(doc);
 assert.equal(doc.nodes[0].children.at(-1).href,'/order');
 assert.equal(doc.nodes[1].children[0].href,'/order?vehicle=second');
 assert.equal(doc.nodes[0].children[0].href,'/track');
 doc.nodes[0].children.at(-1).href='/custom-page';
 connectTemplatePages(doc);
 assert.equal(doc.nodes[0].children.at(-1).href,'/custom-page');
});
test('existing anchors, custom destinations and hidden sections are preserved',()=>{
 const nodes=[block('overview','Custom anchor'),block('saved','Overview'),block('hidden','Collection',{hidden:true}),
  ...['#overview','#collection','/order','https://example.com/vehicles'].map((href,i)=>block('link-'+i,'Link',{type:'link',href}))];
 const before=JSON.stringify(nodes);connectSectionLinks(nodes);assert.equal(JSON.stringify(nodes),before);
});
