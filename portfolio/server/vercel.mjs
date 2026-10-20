import{handleApi}from'./api.mjs';
import{resumeContext}from'./public-context.mjs';
export async function serveVercel(request,path){
  const url=new URL(request.url);url.pathname=path;
  const forwarded=new Request(url,request);
  // Vercel's Request URL reflects the routed domain, including production aliases.
  // VERCEL_URL is the generated deployment hostname and differs from public aliases.
  const origin=process.env.PUBLIC_ORIGIN||url.origin;
  const env={...process.env,PUBLIC_ORIGIN:origin,RESUME_CONTEXT:resumeContext};
  // Conservative shared rate bucket per function instance. Do not trust caller IP headers.
  return handleApi(forwarded,env,{clientId:'vercel-instance'});
}
