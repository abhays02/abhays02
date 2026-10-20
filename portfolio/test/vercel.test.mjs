import test from'node:test';import assert from'node:assert/strict';import{serveVercel}from'../server/vercel.mjs';import status from'../../api/status.mjs';import chat from'../../api/chat.mjs';
test('Vercel status entry exposes no keys and reports AI unavailable before setup',async()=>{const saved={...process.env};try{process.env.AI_MODEL='';process.env.AI_API_KEY='test-private-key';process.env.PUBLIC_ORIGIN='https://studio.example';const response=await status.fetch(new Request('https://studio.example/api/status'));assert.equal(response.status,200);const body=await response.text();assert.equal(JSON.parse(body).aiEnabled,false);assert(!body.includes('test-private-key'))}finally{process.env=saved}});
test('Vercel chat preserves request method, body and same-origin validation',async()=>{const saved={...process.env};try{process.env.AI_MODEL='';process.env.PUBLIC_ORIGIN='https://studio.example';const response=await chat.fetch(new Request('https://studio.example/api/chat',{method:'POST',headers:{origin:'https://studio.example','content-type':'application/json'},body:JSON.stringify({message:'What are your skills?'})}));assert.equal(response.status,503);assert.equal((await response.json()).code,'AI_NOT_CONFIGURED');const other=await chat.fetch(new Request('https://studio.example/api/chat',{method:'POST',headers:{origin:'https://other.example','content-type':'application/json'},body:'{}'}));assert.equal(other.status,403)}finally{process.env=saved}});
test('Vercel adapter maps canonical paths and unknown routes fail',async()=>{const response=await serveVercel(new Request('https://studio.example/api/not-found'),'/api/not-found');assert.equal(response.status,404)});

test('production aliases work when VERCEL_URL names the generated deployment',async()=>{const saved={...process.env};try{delete process.env.PUBLIC_ORIGIN;process.env.VERCEL_URL='generated-deployment.vercel.app';process.env.AI_MODEL='';const response=await chat.fetch(new Request('https://portfolio.vercel.app/api/chat',{method:'POST',headers:{origin:'https://portfolio.vercel.app','content-type':'application/json'},body:'{"message":"My skills?"}'}));assert.equal(response.status,503);assert.equal((await response.json()).code,'AI_NOT_CONFIGURED');const cross=await chat.fetch(new Request('https://portfolio.vercel.app/api/chat',{method:'POST',headers:{origin:'https://elsewhere.example','content-type':'application/json'},body:'{"message":"My skills?"}'}));assert.equal(cross.status,403)}finally{process.env=saved}});

test('Vercel uses trusted per-request runtime identity, never a visitor token header',async()=>{
 const symbol=Symbol.for('@vercel/request-context');const previous=globalThis[symbol];const saved={...process.env};
 try{
  delete process.env.AI_PROVIDER;delete process.env.AI_GATEWAY_API_KEY;delete process.env.VERCEL_OIDC_TOKEN;
  globalThis[symbol]={get:()=>({headers:{'x-vercel-oidc-token':'trusted-runtime-token'}})};
  const response=await status.fetch(new Request('https://studio.example/api/status'));
  const text=await response.text();assert.equal(JSON.parse(text).aiEnabled,true);assert(!text.includes('trusted-runtime-token'));
  delete globalThis[symbol];
  const visitor=await status.fetch(new Request('https://studio.example/api/status',{headers:{'x-vercel-oidc-token':'visitor-token'}}));
  assert.equal((await visitor.json()).aiEnabled,false);
 }finally{globalThis[symbol]=previous;process.env=saved}
});
