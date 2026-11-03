import type {Block} from './document';
export type MotionSettings={reveal:'none'|'fade'|'rise'|'slide'|'zoom';tilt:boolean;duration:number;delay:number};
export function motionSettings(node:Block):MotionSettings{
 const card=/^(Overview card \d+|Collection item \d+|Editorial card \d+|Step \d+)$/.test(node.name);
 const hero=node.name==='Hero visual';
 const reveal=card||hero||node.name==='Section heading'||node.name==='Quote card'||node.tag==='h1';
 const index=Number(node.name.match(/\d+$/)?.[0]||1)-1;
 return {reveal:reveal?'rise':'none',tilt:hero||card,duration:.7,delay:hero?.18:card?(index%3)*.08:0,...node.motion};
}
export function motionAttributes(node:Block){const m=motionSettings(node);return {'data-reveal':m.reveal,'data-tilt':m.tilt?'true':undefined,'data-motion-duration':String(m.duration),'data-motion-delay':String(m.delay)};}
export function validMotion(value:unknown){if(value===undefined)return true;if(!value||typeof value!=='object'||Array.isArray(value))return false;const m=value as MotionSettings;return ['none','fade','rise','slide','zoom'].includes(m.reveal)&&typeof m.tilt==='boolean'&&Number.isFinite(m.duration)&&m.duration>=.2&&m.duration<=2&&Number.isFinite(m.delay)&&m.delay>=0&&m.delay<=2;}
// No external dependencies: the same runtime also runs inside downloaded HTML.
export function startSiteMotion(root:HTMLElement){
 const win=root.ownerDocument.defaultView;if(!win)return()=>{};
 const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 let teardown=()=>{};
 const setup=()=>{
  teardown();if(reduced.matches)return;
  const cleanup:(()=>void)[]=[];
  const effects=new Set<Animation>();
  const reveal=(el:HTMLElement)=>{
   if(el.classList.contains('editable')||typeof el.animate!=='function')return;
   const kind=el.dataset.reveal;
   const from:Keyframe={opacity:0};
   if(kind==='rise')from.translate='0 28px';
   if(kind==='slide')from.translate='-24px 0';
   if(kind==='zoom')from.scale='.96';
   const duration=Math.min(2,Math.max(.2,Number(el.dataset.motionDuration)||.7))*1000;
   const delay=Math.min(2,Math.max(0,Number(el.dataset.motionDelay)||0))*1000;
   const animation=el.animate([from,{opacity:1,translate:'0 0',scale:'1'}],{duration,delay,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'});
   effects.add(animation);animation.onfinish=()=>effects.delete(animation);
  };
  const targets=Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="none"])'));
  if('IntersectionObserver' in win){const observer=new win.IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){reveal(entry.target as HTMLElement);observer.unobserve(entry.target);}},{threshold:.12});targets.forEach(el=>observer.observe(el));cleanup.push(()=>observer.disconnect());}
  else targets.forEach(reveal);
  const fine=win.matchMedia('(hover: hover) and (pointer: fine)');
  if(fine.matches)for(const el of root.querySelectorAll<HTMLElement>('[data-tilt="true"]')){
   if(el.classList.contains('editable'))continue;
   el.dataset.motionCard='true';let frame=0;
   const reset=()=>{win.cancelAnimationFrame(frame);el.style.removeProperty('--tilt-x');el.style.removeProperty('--tilt-y');el.style.removeProperty('--shine-x');el.style.removeProperty('--shine-y');};
   const move=(event:PointerEvent)=>{if(event.pointerType==='touch')return;win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(()=>{const rect=el.getBoundingClientRect();if(!rect.width||!rect.height)return;const x=Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width));const y=Math.min(1,Math.max(0,(event.clientY-rect.top)/rect.height));el.style.setProperty('--tilt-x',`${(0.5-y)*9}deg`);el.style.setProperty('--tilt-y',`${(x-0.5)*9}deg`);el.style.setProperty('--shine-x',`${x*100}%`);el.style.setProperty('--shine-y',`${y*100}%`);});};
   el.addEventListener('pointermove',move);el.addEventListener('pointerleave',reset);el.addEventListener('pointercancel',reset);
   const unfine=()=>{if(!fine.matches)reset();};fine.addEventListener('change',unfine);
   cleanup.push(()=>{reset();delete el.dataset.motionCard;el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',reset);el.removeEventListener('pointercancel',reset);fine.removeEventListener('change',unfine);});
  }
  teardown=()=>{cleanup.forEach(fn=>fn());effects.forEach(effect=>effect.cancel());effects.clear();};
 };
 setup();reduced.addEventListener('change',setup);
 return()=>{teardown();reduced.removeEventListener('change',setup);};
}
export function motionScript(){return `<script>(${startSiteMotion.toString()})(document.body);</script>`;}
export const motionCss=`
@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
 [data-motion-card=true]{transform:perspective(1100px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg));transform-style:preserve-3d;transition:transform .22s ease,filter .22s ease;isolation:isolate}
 [data-motion-card=true]:hover{transform:perspective(1100px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)) translateY(-7px);filter:drop-shadow(0 16px 14px #210b131a);z-index:2}
 [data-motion-card=true]::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at var(--shine-x,50%) var(--shine-y,0%),#ffffff80,transparent 62%);opacity:0;transition:opacity .25s}
 [data-motion-card=true]:hover::after{opacity:.6}
 [data-motion-card=true]>img{transform:translateZ(14px)}
 .site-node a:hover,a.site-node:hover{filter:brightness(1.06)}
}
@media(prefers-reduced-motion:reduce){[data-motion-card=true]{transform:none!important;transition:none!important;filter:none!important}[data-motion-card=true]::after{display:none}}
`;
