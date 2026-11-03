'use client';
import {popupItems,type PopupSettings,type PopupItem} from '../../lib/popup';
export default function PopupList({config,onChange}:{config:PopupSettings;onChange:(patch:Partial<PopupSettings>)=>void}){
 const items=popupItems(config,true);
 const update=(id:string,patch:Partial<PopupItem>)=>onChange({items:items.map(i=>i.id===id?{...i,...patch}:i)});
 const move=(index:number,offset:number)=>{const next=[...items];[next[index],next[index+offset]]=[next[index+offset],next[index]];onChange({items:next});};
 return <section aria-label="Popup messages">
  <p className="muted">Add announcements or genuine customer comments. Messages appear in this order. List text is shared across languages.</p>
  {!items.length&&<p className="muted">No messages yet. Add your first popup below.</p>}
  {items.map((item,index)=><div key={item.id} style={{border:'1px solid #d5d5dc',borderRadius:10,padding:12,marginBottom:14}}>
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><strong>Message {index+1}</strong><label><input type="checkbox" checked={item.enabled} onChange={e=>update(item.id,{enabled:e.target.checked})}/> Enabled</label></div>
   <label className="field"><span>Type</span><select value={item.kind} onChange={e=>update(item.id,{kind:e.target.value as PopupItem['kind']})}><option value="announcement">Announcement</option><option value="comment">Customer comment</option></select></label>
   <label className="field"><span>Title</span><input maxLength={200} value={item.title} onChange={e=>update(item.id,{title:e.target.value})}/></label>
   <label className="field"><span>Message</span><textarea rows={3} maxLength={2000} value={item.message} onChange={e=>update(item.id,{message:e.target.value})}/></label>
   {item.kind==='comment'&&<label className="field"><span>Customer name (optional)</span><input maxLength={100} value={item.author} onChange={e=>update(item.id,{author:e.target.value})}/></label>}
   <div style={{display:'flex',gap:8}}><button type="button" aria-label={`Move message ${index+1} up`} disabled={index===0} onClick={()=>move(index,-1)}>↑ Up</button><button type="button" aria-label={`Move message ${index+1} down`} disabled={index===items.length-1} onClick={()=>move(index,1)}>↓ Down</button><button type="button" onClick={()=>onChange({items:items.filter(i=>i.id!==item.id)})}>Delete</button></div>
  </div>)}
  <button type="button" className="full-button" disabled={items.length>=30} onClick={()=>onChange({items:[...items,{id:crypto.randomUUID(),kind:'announcement',enabled:true,title:'',message:'',author:''}]})}>+ Add popup message</button>
  <p className="muted">{items.length} / 30 messages. Blank or disabled messages do not appear.</p>
 </section>;
}
