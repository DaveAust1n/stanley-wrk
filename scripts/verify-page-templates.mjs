import test from 'node:test';
import assert from 'node:assert/strict';
import {templateCopy,validPageTemplates} from '../lib/page-templates.ts';
test('blank template copy stays blank and locale overrides fall back to saved English',()=>{
 const settings={payment:{en:{title:'Your heading',intro:''},fr:{title:'Votre titre'}}};
 assert.equal(templateCopy(settings,'payment','fr').title,'Votre titre');
 assert.equal(templateCopy(settings,'payment','fr').intro,'');
 assert.equal(templateCopy(settings,'payment','es').title,'Your heading');
});
test('page template validation rejects unsupported pages and malformed fields',()=>{
 assert.equal(validPageTemplates({payment:{en:{title:'A heading',intro:''}}}),true);
 for(const input of [{other:{en:{title:'bad'}}},{track:{en:{title:23}}},{track:{en:{unknown:'bad'}}},{payment:{en:{body:'x'.repeat(2001)}}}])assert.equal(validPageTemplates(input),false);
});
