export const DURATION=12;
export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const mix=(a,b,t)=>a+(b-a)*clamp(t);
export const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
export function timeline(progress,reduced=false){const p=reduced?1:clamp(progress);const reveal=smooth(.06,.7,p);return{progress:p,frame:Math.round(p*DURATION*30),chapter:p<.23?0:p<.7?1:2,zoom:mix(6.2,1,reveal),title:smooth(.58,.88,p),pose:p<.46?2:p<.65?0:p<.83?2:3,black:1-smooth(0,.035,p)}}
export function portraitLayout(width,height,scroll=0){const p=smooth(.04,.86,scroll),mobile=width<700;const start={x:mobile?width*.55-height*.88*(535/562)*.43:width*.48,y:height*.2,width:height*.72,height:height*.88};const end=mobile?{x:width*.55-height*.43*(535/562)*.43,y:height*.45,width:height*.43*(535/562),height:height*.43}:{x:width*.61,y:height*.18,width:height*.48,height:height*.59};return{x:mix(start.x,end.x,p),y:mix(start.y,end.y,p),width:mix(start.width,end.width,p),height:mix(start.height,end.height,p),progress:p}}
export function dragProgress(start,delta,width){return clamp(start+delta/Math.max(width*.7,1))}
