'use client';
import {useState,type FormEvent} from 'react';
import {Search} from 'lucide-react';
import styles from './flow.module.css';
export default function TrackingForm(){
 const [code,setCode]=useState('');const [submitted,setSubmitted]=useState(false);
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(code.trim())setSubmitted(true);}
 return <form className={styles.form} onSubmit={submit}><label htmlFor="tracking-code" className={styles.label}>Your tracking code</label><input id="tracking-code" name="code" className={styles.input} placeholder="Enter your code" value={code} onChange={e=>{setCode(e.target.value);setSubmitted(false)}} required maxLength={100} autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-describedby="tracking-hint"/><p id="tracking-hint" className={styles.hint}>Use the unique code issued after your payment is confirmed.</p><button type="submit" className={styles.primary}><Search size={16}/> Track order</button>{submitted&&<div className={styles.result} role="status">Order tracking isn’t connected yet. No delivery status is available. Please check again when tracking opens.</div>}</form>;
}
