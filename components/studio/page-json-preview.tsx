'use client';

import {useRef} from 'react';
import {Upload,X} from 'lucide-react';

export default function PageJsonPreview(){
 const dialog=useRef<HTMLDialogElement>(null);
 return <>
  <button className="full-button" onClick={()=>dialog.current?.showModal()}><Upload size={15}/> Import page JSON</button>
  <p className="muted">Paste or upload page JSON, edit its fields, and download changes. Separate preview; does not update the site draft.</p>
  <dialog ref={dialog} aria-labelledby="page-json-preview-title" style={{position:'fixed',inset:0,width:'min(1440px,96vw)',height:'94dvh',maxWidth:'96vw',maxHeight:'94dvh',margin:'auto',padding:0,border:'1px solid #cbd5df',borderRadius:14,background:'white',color:'#172b3a',overflow:'hidden'}}>
   <div style={{height:52,padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,borderBottom:'1px solid #d8e1e8'}}>
    <h2 id="page-json-preview-title" style={{margin:0,fontSize:15}}>Import page JSON · Editable preview</h2>
    <button aria-label="Close JSON preview" autoFocus onClick={()=>dialog.current?.close()} style={{display:'flex',gap:6,alignItems:'center',padding:'8px 10px',borderRadius:6}}><X size={16}/> Close</button>
   </div>
   <iframe title="Page JSON importer and editable preview" src="/page-data-editor.html" sandbox="allow-scripts allow-downloads allow-modals" style={{display:'block',width:'100%',height:'calc(100% - 52px)',border:0}}/>
  </dialog>
 </>;
}
