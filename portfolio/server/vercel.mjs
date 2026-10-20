import{handleApi}from'./api.mjs';
import{resumeContext}from'./public-context.mjs';
import{getVercelOidcTokenSync}from'@vercel/oidc';
export async function serveVercel(request,path){
  const url=new URL(request.url);url.pathname=path;
  const forwarded=new Request(url,request);
  // Vercel's Request URL reflects the routed domain, including production aliases.
  // VERCEL_URL is the generated deployment hostname and differs from public aliases.
  const origin=process.env.PUBLIC_ORIGIN||url.origin;
  // Fluid compute supplies a fresh token in trusted runtime context per request.
  // Never read credentials from caller-controlled Request headers.
  let oidc=process.env.VERCEL_OIDC_TOKEN;
  try{oidc=getVercelOidcTokenSync()}catch{}
  const env={...process.env,VERCEL_OIDC_TOKEN:oidc,PUBLIC_ORIGIN:origin,RESUME_CONTEXT:resumeContext};
  // Conservative shared rate bucket per function instance. Do not trust caller IP headers.
  return handleApi(forwarded,env,{clientId:'vercel-instance'});
}
