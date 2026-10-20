import{handleApi}from'./api.mjs';
import{resumeContext}from'./public-context.mjs';
export async function serveVercel(request,path){
  const url=new URL(request.url);url.pathname=path;
  const forwarded=new Request(url,request);
  // Deployment URL comes from Vercel's server environment, never from client input.
  const origin=process.env.PUBLIC_ORIGIN||(process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:url.origin);
  const env={...process.env,PUBLIC_ORIGIN:origin,RESUME_CONTEXT:resumeContext};
  // Conservative shared rate bucket per function instance. Do not trust caller IP headers.
  return handleApi(forwarded,env,{clientId:'vercel-instance'});
}
