'use client';
import {checkoutText,type CheckoutLocale} from '../../lib/checkout-languages';
import {useState,type FormEvent} from 'react';
import {Search} from 'lucide-react';
import styles from './flow.module.css';
export default function TrackingForm({locale='en'}:{locale?:CheckoutLocale}){
 const t=checkoutText(locale);
 const [code,setCode]=useState('');const [submitted,setSubmitted]=useState(false);
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(code.trim())setSubmitted(true);}
 return <form className={styles.form} onSubmit={submit}><label htmlFor="tracking-code" className={styles.label}>{t('code')}</label><input id="tracking-code" name="code" dir="ltr" className={styles.input} placeholder={t('placeholder')} value={code} onChange={e=>{setCode(e.target.value);setSubmitted(false)}} required maxLength={100} autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-describedby="tracking-hint"/><p id="tracking-hint" className={styles.hint}>{t('hint')}</p><button type="submit" className={styles.primary}><Search size={16}/> {t('track')}</button>{submitted&&<div className={styles.result} role="status">{t('notConnected')}</div>}</form>;
}
