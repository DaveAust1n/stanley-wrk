import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const id='11111111-1111-4111-8111-111111111111';
let confirmed=false;
const backend=http.createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');
 const send=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data))};
 if(req.headers['x-checkout-key']!=='isolated-test-token'||req.headers['x-admin-key']!=='isolated-test-admin')return send(401,{error:'unauthorized'});
 if(req.url==='/admin/payments?status=submitted')return send(200,{payments:[{id,orderCode:'ORD-ABCDEF123456',status:confirmed?'confirmed':'submitted'}]});
 if(req.url==='/admin/orders/ORD-ABCDEF123456')return send(200,{code:'ORD-ABCDEF123456',status:confirmed?'paid':'awaiting_payment',fulfilmentStatus:'processing'});
 if(req.url==='/admin/payments/'+id+'/confirm'){const alreadyConfirmed=confirmed;confirmed=true;return send(200,{ok:true,alreadyConfirmed,trackingCode:'TRK-ABCDEF123456'});}
 if(req.url==='/admin/payments/'+id+'/reject')return send(200,{ok:true});
 if(req.url==='/admin/orders/ORD-ABCDEF123456/fulfilment')return send(200,{ok:true});
 send(404,{error:'not_found'});
});
backend.listen(0,'127.0.0.1');await once(backend,'listening');
const temp=http.createServer();temp.listen(0,'127.0.0.1');await once(temp,'listening');const port=temp.address().port;await new Promise(r=>temp.close(r));
const origin='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',CHECKOUT_BACKEND_URL:'http://127.0.0.1:'+backend.address().port,CHECKOUT_BACKEND_TOKEN:'isolated-test-token',ADMIN_SESSION_SECRET:'isolated-integration-session-secret-over-32-characters'},stdio:['ignore','pipe','pipe']});
let output='';child.stdout.on('data',chunk=>output+=chunk.toString());child.stderr.on('data',chunk=>output+=chunk.toString());
try{
 await Promise.race([new Promise((resolve,reject)=>{const inspect=()=>{if(output.includes('Ready in'))resolve();else if(child.exitCode!==null)reject(Error('Next test server stopped'));};child.stdout.on('data',inspect);child.on('exit',inspect);inspect()}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Next test server did not start')),20000))]);
 const request=(path,method='GET',data,cookie,foreign=false)=>fetch(origin+path,{method,redirect:'manual',headers:{...(data?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{Origin:foreign?'https://foreign.invalid':origin}:{}),...(cookie?{Cookie:cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});
 assert.equal((await request('/api/admin/payments?status=submitted')).status,401);
 assert.equal((await fetch(origin+'/api/admin/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{'})).status,400);
 assert.equal((await request('/api/admin/session','POST',{code:'isolated-test-admin'},undefined,true)).status,403);
 assert.equal((await request('/api/admin/session','POST',{code:'wrong-code'})).status,401);
 const login=await request('/api/admin/session','POST',{code:'isolated-test-admin'});assert.equal(login.status,200);const setCookie=login.headers.get('set-cookie');assert.match(setCookie,/HttpOnly/i);assert.match(setCookie,/Secure/i);assert.match(setCookie,/SameSite=strict/i);assert.equal(setCookie.includes('isolated-test-admin'),false);const cookie=setCookie.split(';')[0];
 const list=await request('/api/admin/payments?status=submitted','GET',undefined,cookie);assert.equal(list.status,200);assert.equal((await list.json()).payments.length,1);
 assert.equal((await request('/api/admin/payments/'+id+'/confirm','POST',{},cookie)).status,400);
 assert.equal((await request('/api/admin/payments/'+id+'/confirm','POST',{verifiedReceipt:true},cookie,true)).status,403);
 const receipt=await request('/api/admin/payments/'+id+'/confirm','POST',{verifiedReceipt:true,note:'Isolated test'},cookie);assert.equal(receipt.status,200);assert.equal((await receipt.json()).alreadyConfirmed,false);
 const repeated=await request('/api/admin/payments/'+id+'/confirm','POST',{verifiedReceipt:true},cookie);assert.equal((await repeated.json()).alreadyConfirmed,true);
 assert.equal((await request('/api/admin/payments/'+id+'/reject','POST',{},cookie)).status,400);
 assert.equal((await request('/api/admin/orders/ORD-ABCDEF123456/fulfilment','POST',{status:'invented'},cookie)).status,400);
 assert.equal((await request('/api/admin/orders/ORD-ABCDEF123456/fulfilment','POST',{status:'delivered',note:'Isolated test'},cookie)).status,200);
 const logout=await request('/api/admin/session','DELETE',undefined,cookie);assert.equal(logout.status,200);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/i);
 console.log('PASS: isolated admin sign-in, sealed cookies, unauthorized access, CSRF, receipt acknowledgement, repeat confirmation, rejection validation, delivery update and sign-out.');
}finally{child.kill('SIGTERM');backend.closeAllConnections();backend.close();}
