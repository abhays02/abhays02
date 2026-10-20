import{serveVercel}from'../portfolio/server/vercel.mjs';
export default {fetch(request){return serveVercel(request,'/api/repos')}};
