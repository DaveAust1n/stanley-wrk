'use client';
import {useEffect,useRef} from 'react';
import {popupSettings,popupMarkup,popupItems,startPopupRotation,type PopupSettings} from '../../lib/popup';
export default function Announcement({config,previewKey=0,editor=false}:{config?:Partial<PopupSettings>;previewKey?:number;editor?:boolean}){
 const host=useRef<HTMLDivElement>(null);
 const serialized=JSON.stringify(popupSettings(config));
 useEffect(()=>{
  const container=host.current;if(!container)return;
  container.replaceChildren();if(editor&&!previewKey)return;
  const p=JSON.parse(serialized) as PopupSettings;
  container.innerHTML=popupMarkup(p,editor);
  const el=container.querySelector<HTMLElement>('.announcement-popup');if(!el)return;
  const stop=startPopupRotation(el,popupItems(p),{delay:editor?0:p.delay,duration:p.duration,gap:p.gap??8,repeat:p.repeat??false,preview:editor});
  return()=>{stop();container.replaceChildren();};
 },[serialized,previewKey,editor]);
 return <div ref={host}/>;
}
