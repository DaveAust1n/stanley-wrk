import test from 'node:test';
import assert from 'node:assert/strict';
import {connectSectionLinks} from '../lib/navigation.ts';
const block=(id,name,extra={})=>({id,name,type:'box',style:{},...extra});
test('saved section IDs work with older navigation and CTA links',()=>{
 const nodes=[block('element-63','Overview'),block('element-85','Video story 1'),block('element-174','Process'),block('element-271','Collection'),
  block('nav','Navigation',{children:['overview','stories','process','collection'].map(slug=>block('link-'+slug,slug,{type:'link',href:'#'+slug}))})];
 connectSectionLinks(nodes);
 assert.deepEqual(nodes.at(-1).children.map(n=>n.href),['#element-63','#element-85','#element-174','#element-271']);
 assert.equal(nodes[0].id,'element-63');
});
test('existing anchors, custom destinations and hidden sections are preserved',()=>{
 const nodes=[block('overview','Custom anchor'),block('saved','Overview'),block('hidden','Collection',{hidden:true}),
  ...['#overview','#collection','/order','https://example.com/vehicles'].map((href,i)=>block('link-'+i,'Link',{type:'link',href}))];
 const before=JSON.stringify(nodes);connectSectionLinks(nodes);assert.equal(JSON.stringify(nodes),before);
});
