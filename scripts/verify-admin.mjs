import test from 'node:test';
import assert from 'node:assert/strict';
import {sealData,unsealData} from 'iron-session';
import {adminDestination,adminCommand,sameOrigin,adminJson,AdminError} from '../lib/admin-contract.ts';
const id='11111111-1111-4111-8111-111111111111';
test('admin proxy only exposes the review and fulfilment allowlist',()=>{
 assert.equal(adminDestination(['payments'],'GET','submitted'),'/admin/payments?status=submitted');
 assert.equal(adminDestination(['orders','ORD-ABCDEF123456'],'GET',null),'/admin/orders/ORD-ABCDEF123456');
 assert.equal(adminDestination(['payments',id,'confirm'],'POST',null),'/admin/payments/'+id+'/confirm');
 for(const args of [[['orders'],'POST',null],[['payments'],'GET','invalid'],[['..','orders'],'GET',null],[['orders','ORD-invalid'],'GET',null]])assert.throws(()=>adminDestination(...args),AdminError);
});
test('confirmation needs explicit receipt verification and rejection needs a reason',()=>{
 assert.throws(()=>adminCommand('/admin/payments/'+id+'/confirm',{note:'x'}),/Verify receipt/);
 assert.deepEqual(adminCommand('/admin/payments/'+id+'/confirm',{verifiedReceipt:true,note:' Checked receipt '}),{note:'Checked receipt'});
 assert.throws(()=>adminCommand('/admin/payments/'+id+'/reject',{note:'  '}),/reason/);
 assert.deepEqual(adminCommand('/admin/payments/'+id+'/reject',{note:' Wrong amount '}),{note:'Wrong amount'});
 assert.throws(()=>adminCommand('/admin/orders/ORD-ABCDEF123456/fulfilment',{status:'invented'}),/valid delivery/);
 assert.throws(()=>adminCommand('/admin/orders/ORD-ABCDEF123456/fulfilment',{status:'delivered',note:'x'.repeat(501)}),/500/);
});
test('state changes reject missing and foreign origins',()=>{
 for(const origin of [null,'https://unrelated.example'])assert.throws(()=>sameOrigin(new Request('https://shop.example/api/admin/session',{method:'POST',headers:origin?{origin}:{}})),/blocked/);
 assert.doesNotThrow(()=>sameOrigin(new Request('https://shop.example/api/admin/session',{method:'POST',headers:{origin:'https://shop.example'}})));
});
test('admin code stays sealed and forged or differently signed sessions are rejected',async()=>{
 const password='test-only-session-key-with-more-than-32-characters';
 const seal=await sealData({adminCode:'test-only-not-a-real-credential'},{password,ttl:60});
 assert.equal(seal.includes('test-only-not-a-real-credential'),false);
 assert.equal((await unsealData(seal,{password,ttl:60})).adminCode,'test-only-not-a-real-credential');
 assert.deepEqual(await unsealData(seal.slice(0,-5)+'xxxxx',{password,ttl:60}),{});
 assert.deepEqual(await unsealData(seal,{password:'a-different-test-key-of-at-least-32-characters',ttl:60}),{});
});

test('malformed JSON and non-object bodies fail as client errors',()=>{for(const body of ['{','null','[]'])assert.throws(()=>adminJson(body),error=>error.status===400);});
