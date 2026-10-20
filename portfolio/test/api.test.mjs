import test from 'node:test';import assert from'node:assert/strict';import{handleApi,Limiter}from'../server/api.mjs';
const env={AI_PROVIDER:'compatible',AI_API_KEY:'test-private-key',AI_MODEL:'test-model',AI_BASE_URL:'https://provider.example/v1',PUBLIC_ORIGIN:'https://studio.example',RESUME_CONTEXT:'Abhay reduced load time to 600ms.'};const req=(body,headers={})=>new Request('https://studio.example/api/chat',{method:'POST',headers:{'content-type':'application/json',origin:'https://studio.example',...headers},body:JSON.stringify(body)});const deps=()=>({limiter:new Limiter(),clientId:'test'});
test('status shows configuration without key or endpoint',async()=>{const r=await handleApi(new Request('https://studio.example/api/status'),env);const text=await r.text();assert.equal(JSON.parse(text).aiEnabled,true);assert(!text.includes('private-key'));assert(!text.includes('provider.example'))});
test('no key means honest unavailable state',async()=>{const r=await handleApi(req({message:'hello'}),{});assert.equal(r.status,503);assert.equal((await r.json()).code,'AI_NOT_CONFIGURED')});
test('rejects cross-origin spending requests',async()=>{const r=await handleApi(req({message:'hello'},{origin:'https://other.example'}),env);assert.equal(r.status,403)});
test('validates input and never accepts browser API key or model overrides',async()=>{for(const message of['',null,12,'a'.repeat(1501)]){assert.equal((await handleApi(req({message}),env)).status,400)}let captured;const r=await handleApi(req({message:'My skills?',apiKey:'browser-key',model:'other-model',baseURL:'https://attacker.example'}),env,{...deps(),fetch:async(url,options)=>{captured={url,options};return Response.json({choices:[{message:{content:'Abhay builds AI systems.'}}]})}});assert.equal(r.status,200);assert.equal(captured.url,'https://provider.example/v1/chat/completions');assert.equal(captured.options.headers.Authorization,'Bearer test-private-key');const p=JSON.parse(captured.options.body);assert.equal(p.model,'test-model');assert(p.messages[0].content.includes('600ms'));assert.equal(p.messages[1].content,'My skills?');assert(!JSON.stringify(p).includes('browser-key'))});
test('body cap is enforced even without content-length',async()=>{const r=await handleApi(req({message:'x'.repeat(13000)}),env);assert.equal(r.status,413)});
test('provider error bodies and credentials do not reach visitors',async()=>{const r=await handleApi(req({message:'hello'}),env,{...deps(),fetch:async()=>new Response('private provider body test-private-key',{status:401})});assert.equal(r.status,502);assert(!(await r.text()).includes('test-private-key'))});
test('provider timeouts fail gracefully',async()=>{const r=await handleApi(req({message:'hello'}),env,{...deps(),fetch:async()=>{throw Error('private-details')}});assert.equal(r.status,502);assert(!(await r.text()).includes('private-details'))});
test('rejects insecure nonlocal API endpoints',async()=>{let called=false;const r=await handleApi(req({message:'hello'}),{...env,AI_BASE_URL:'http://insecure.example/v1'},{...deps(),fetch:async()=>{called=true}});assert.equal(r.status,503);assert.equal(called,false)});
test('per-minute and process daily limits',()=>{const limit=new Limiter();for(let i=0;i<8;i++)assert(limit.take('one',20));assert(!limit.take('one',20));for(let i=0;i<8;i++)assert(limit.take('two',20));for(let i=0;i<4;i++)assert(limit.take('three',20));assert(!limit.take('four',20))});
test('optional Turnstile checks hostname before calling AI',async()=>{let calls=0;const r=await handleApi(req({message:'hello',turnstileToken:'token'}),{...env,TURNSTILE_SECRET_KEY:'private-turnstile'},{...deps(),fetch:async()=>{calls++;return Response.json({success:true,hostname:'other.example'})}});assert.equal(r.status,403);assert.equal(calls,1)});
test('Gemini and Anthropic adapters parse structured replies',async()=>{for(const provider of['gemini','anthropic']){const r=await handleApi(req({message:'hello'}),{...env,AI_PROVIDER:provider,GEMINI_API_KEY:'g',ANTHROPIC_API_KEY:'a'},{...deps(),fetch:async()=>Response.json(provider==='gemini'?{candidates:[{content:{parts:[{text:'Verified answer'}]}}]}:{content:[{type:'text',text:'Verified answer'}]})});assert.equal((await r.json()).answer,'Verified answer')}});
test('OpenAI responses adapter extracts output text',async()=>{const r=await handleApi(req({message:'hello'}),{...env,AI_PROVIDER:'openai',OPENAI_API_KEY:'key'},{...deps(),fetch:async()=>Response.json({output:[{content:[{type:'output_text',text:'Answer'}]}]})});assert.equal((await r.json()).answer,'Answer')});
test('GitHub integration filters forks, archived and other owners',async()=>{const r=await handleApi(new Request('https://studio.example/api/repos'),{}, {fetch:async()=>Response.json([{name:'one',owner:{login:'abhays02'},description:'test',language:'Python'},{name:'fork',fork:true,owner:{login:'abhays02'}},{name:'archived',archived:true,owner:{login:'abhays02'}},{name:'outsider',owner:{login:'someone'}}])});const data=await r.json();assert.deepEqual(data.repos.map(x=>x.name),['one']);assert.equal(data.repos[0].url,'https://github.com/abhays02/one')});

test('Gateway uses server OIDC, free default, fixed endpoint and resume priority',async()=>{
 const calls=[];const token='test-server-oidc';
 const gatewayEnv={VERCEL_OIDC_TOKEN:token,RESUME_CONTEXT:'PRIMARY RESUME: Abhay studied AI/ML.'};
 const response=await handleApi(req({message:'Education?',model:'paid-model',apiKey:'browser-key'}),gatewayEnv,{...deps(),fetch:async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/models'))return Response.json({data:[{id:'nvidia/nemotron-3.5-lightning-free',type:'language',pricing:{input:'0',output:'0'}}]});
  return Response.json({choices:[{message:{content:'Abhay studied AI/ML.'}}]});
 }});
 assert.equal(response.status,200);assert.equal((await response.json()).mode,'ai');
 assert.equal(calls[1].url,'https://ai-gateway.vercel.sh/v1/chat/completions');
 assert.equal(calls[1].options.headers.Authorization,'Bearer '+token);
 const payload=JSON.parse(calls[1].options.body);assert.equal(payload.model,'nvidia/nemotron-3.5-lightning-free');
 assert(payload.messages[0].content.includes('resume is the primary authority'));
 assert(payload.messages[0].content.includes('PRIMARY RESUME'));assert(!payload.providerOptions);
 const status=await handleApi(new Request('https://studio.example/api/status'),gatewayEnv);
 const statusText=await status.text();assert.equal(JSON.parse(statusText).aiEnabled,true);assert(!statusText.includes(token));
});
test('Gateway never calls inference when model pricing changes or cannot be verified',async()=>{
 for(const entry of [null,{type:'language',pricing:{input:'0.00001',output:'0'}},{type:'language',pricing:{input:'0',output:'0',varies_by_provider:true}},{type:'evaluation',pricing:{input:'0',output:'0'}}]){
  let calls=0;const response=await handleApi(req({message:'Skills?'}),{AI_GATEWAY_API_KEY:'private-key'}, {...deps(),fetch:async()=>{calls++;return Response.json({data:entry?[{id:'nvidia/nemotron-3.5-lightning-free',...entry}]:[]})}});
  assert.equal(response.status,503);assert.equal((await response.json()).code,'FREE_MODEL_UNAVAILABLE');assert.equal(calls,1);
 }
 const response=await handleApi(req({message:'Skills?'}),{AI_GATEWAY_API_KEY:'private-key'},{...deps(),fetch:async()=>{throw Error('catalog unavailable')}});
 assert.equal(response.status,503);
});
