import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const code='ORD-ABCDEF123456',trackingCode='TRK-ABCDEF123456',id='11111111-1111-4111-8111-111111111111';
let creates=0,paid=false,submitted=false,expired=false,captured,prices=true;
const settings={vehicles:[{id:'v1',name:'Isolated test vehicle',description:'',price:100}],deliveryFee:10,deliveryOptions:[{id:'standard',name:'Standard delivery',description:'',estimate:'',price:2}]};
const payment=()=>({id,currency:'DOGE',network:'Dogecoin',walletAddress:'TEST_WALLET_NO_FUNDS',rateUsd:0.2,expectedAmount:560,status:paid?'confirmed':submitted?'submitted':expired?'expired':'awaiting',expiresAt:new Date(Date.now()+(expired?-1:3600)*1000).toISOString(),secondsRemaining:expired?0:3600});
let quoted=false;
const backend=http.createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');const send=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data))};let raw='';for await(const chunk of req)raw+=chunk;const b=raw?JSON.parse(raw):{};
 if(req.url.startsWith('/document?')){assert.equal(req.headers['x-studio-key'],'test-studio-token');return send(200,{document:{title:'Isolated test site',description:'',nodes:[],designVersion:4,orderForm:prices?settings:undefined},savedAt:null})}
 assert.equal(req.headers['x-checkout-key'],'test-customer-token');assert.equal(req.headers['x-admin-key'],undefined);
 if(req.url==='/health')return send(200,{ok:true});
 if(req.url==='/orders'){creates++;captured=b;return send(201,{code})}
 if(req.url==='/orders/'+code)return send(200,{code,status:paid?'paid':submitted?'payment_submitted':'awaiting_payment',vehicleName:settings.vehicles[0].name,deliveryName:'Standard delivery',vehiclePrice:100,deliveryFee:10,deliveryPrice:2,totalUsd:112,createdAt:new Date().toISOString(),trackingCode:paid?trackingCode:null,payments:quoted?[payment()]:[],options:[{currency:'DOGE',network:'Dogecoin',isStable:false}]});
 if(req.url==='/orders/'+code+'/payments'){assert.deepEqual(b,{currency:'DOGE',network:'Dogecoin'});quoted=true;return send(201,payment())}
 if(req.url==='/orders/'+code+'/payments/'+id+'/tx'){assert.equal(b.txHash,'a'.repeat(64));submitted=true;return send(200,{ok:true})}
 if(req.url==='/track/'+code||req.url==='/track/'+trackingCode)return send(200,{code,status:paid?'paid':submitted?'payment_submitted':'awaiting_payment',vehicleName:'Isolated test vehicle',deliveryName:'Standard delivery',paymentStatus:paid?'confirmed':submitted?'submitted':null,fulfilmentStatus:paid?'in_transit':null,fulfilmentNote:paid?'Isolated delivery update':null,trackingCode:paid?trackingCode:null});
 send(404,{error:'order_not_found'});
});backend.listen(0,'127.0.0.1');await once(backend,'listening');const temp=http.createServer();temp.listen(0,'127.0.0.1');await once(temp,'listening');const port=process.env.CUSTOMER_BROWSER_TEST?3000:temp.address().port;await new Promise(r=>temp.close(r));const origin='http://127.0.0.1:'+port,backendUrl='http://127.0.0.1:'+backend.address().port;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname',process.env.CUSTOMER_BROWSER_TEST?'0.0.0.0':'127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',CHECKOUT_BACKEND_URL:backendUrl,CHECKOUT_BACKEND_TOKEN:'test-customer-token',STUDIO_BACKEND_URL:backendUrl,STUDIO_BACKEND_TOKEN:'test-studio-token',CUSTOMER_SESSION_SECRET:'test-customer-secret-at-least-thirty-two-characters'},stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',c=>output+=c);child.stderr.on('data',c=>output+=c);
try{await Promise.race([new Promise((resolve,reject)=>{const check=()=>{if(output.includes('Ready in'))resolve();else if(child.exitCode!==null)reject(Error(output))};child.stdout.on('data',check);child.on('exit',check);check()}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Next failed to start: '+output)),20000))]);
 if(process.env.CUSTOMER_BROWSER_TEST){console.log('Isolated customer browser test: '+origin+'/order');await new Promise(()=>{});}
 const request=(path,method='GET',data,cookie,foreign=false)=>fetch(origin+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{Origin:foreign?'https://foreign.invalid':origin}:{}),...(cookie?{Cookie:cookie}:{})},...(data?{body:JSON.stringify(data)}:{})});
 const body={requestId:id,vehicleId:'v1',deliveryId:'standard',expectedTotal:112,locale:'en',customer:{name:'Test',email:'test@example.com',phone:'12345678',address:'Test street',city:'City',country:'Country',postcode:''}};
 assert.equal((await request('/api/checkout/status')).status,200);
 assert.equal((await request('/api/checkout/orders','POST',body,undefined,true)).status,403);
 assert.equal((await request('/api/checkout/orders','POST',{...body,total:1})).status,400);
 const stale=await request('/api/checkout/orders','POST',{...body,expectedTotal:1});assert.equal(stale.status,409);assert.deepEqual((await stale.json()).settings,settings);
 prices=false;assert.equal((await request('/api/checkout/orders','POST',body)).status,503);prices=true;
 const created=await request('/api/checkout/orders','POST',body);assert.equal(created.status,201);assert.equal((await created.json()).code,code);assert.equal(captured.total,112);const sealed=created.headers.get('set-cookie');assert.match(sealed,/HttpOnly/);assert.match(sealed,/Secure/);assert.match(sealed,/SameSite=strict/i);assert.equal(sealed.includes(code),false);const cookie=sealed.split(';')[0];
 const repeat=await request('/api/checkout/orders','POST',body,cookie);assert.equal((await repeat.json()).reused,true);assert.equal(creates,1);
 assert.equal((await request('/api/checkout/orders/'+code)).status,403);
 assert.equal((await request('/api/checkout/orders/'+code+'/payments','POST',{currency:'DOGE',network:'Dogecoin'})).status,403);
 const order=await request('/api/checkout/orders/'+code,'GET',undefined,cookie);assert.equal((await order.json()).totalUsd,112);
 assert.equal((await request('/api/checkout/orders/'+code+'/payments','POST',{currency:'DOGE',network:'Dogecoin'},cookie)).status,200);
 expired=true;const quote=await request('/api/checkout/orders/'+code,'GET',undefined,cookie);assert.equal((await quote.json()).payments[0].status,'expired');
 assert.equal((await request('/api/checkout/orders/'+code+'/payments/'+id+'/tx','POST',{txHash:'a'.repeat(64)},cookie)).status,200);
 const pending=await request('/api/checkout/track/'+code);assert.equal((await pending.json()).status,'payment_submitted');
 paid=true;const track=await request('/api/checkout/track/'+trackingCode);const data=await track.json();assert.equal(data.fulfilmentStatus,'in_transit');assert.equal(data.trackingCode,trackingCode);assert.equal('customer' in data,false);
 for(const [path,title] of [['/order','Choose your vehicle'],['/payment?order='+code,'Payment details'],['/track?code='+trackingCode,'Order reference']]){const response=await request(path,'GET',undefined,cookie);assert.equal(response.status,200);assert.equal((await response.text()).includes(title),true)}
 console.log('PASS: isolated published-price validation, CSRF, sealed order access, retry reuse, quote, expiry, late transaction review, tracking, confirmation and delivery states, and public page rendering. No production data or payments used.');
}finally{child.kill('SIGTERM');backend.closeAllConnections();backend.close()}
