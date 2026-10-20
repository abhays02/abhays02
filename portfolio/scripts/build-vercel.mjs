import{readFile,writeFile}from'node:fs/promises';
const resume=await readFile(new URL('../content/resume.txt',import.meta.url),'utf8');
const projects=JSON.parse(await readFile(new URL('../dist/projects.json',import.meta.url),'utf8'));
await writeFile(new URL('../server/public-context.mjs',import.meta.url),'// Generated from the supplied resume and public project metadata.\nexport const resumeContext = '+JSON.stringify(resume+'\nPUBLIC GITHUB PROJECTS:\n'+JSON.stringify(projects))+';\n');
await writeFile(new URL('../dist/site-config.json',import.meta.url),JSON.stringify({backend:true},null,2)+'\n');
console.log('Vercel static output and resume-grounded API context prepared.');
