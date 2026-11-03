import {checkoutLocale,checkoutText,localeHref} from '../../lib/checkout-languages';
import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight,MapPin} from 'lucide-react';
import CheckoutShell from '../../components/checkout/shell';
import TrackingForm from '../../components/checkout/tracking-form';
import styles from '../../components/checkout/flow.module.css';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string|string[]}>}):Promise<Metadata>{const t=checkoutText(checkoutLocale((await searchParams).lang));return{title:t('tracking'),description:t('trackIntro'),robots:{index:false,follow:false}};}
export default async function TrackPage({searchParams}:{searchParams:Promise<{lang?:string|string[]}>}){
 const locale=checkoutLocale((await searchParams).lang);const t=checkoutText(locale);
 return <CheckoutShell active="track" locale={locale}><div className={styles.eyebrow}>{t('tracking')}</div><h1 className={styles.title}>{t('trackTitle')}</h1><p className={styles.subtitle}>{t('trackIntro')}</p><div className={styles.grid}><section className={styles.card} aria-labelledby="track-heading"><div className={styles.icon}><MapPin size={22}/></div><h2 id="track-heading">{t('find')}</h2><p>{t('private')}</p><TrackingForm locale={locale}/></section><aside className={styles.card}><h2>{t('need')}</h2><p>{t('needText')}</p><div className={styles.notice}>{t('trackNotice')}</div><Link href={localeHref('/payment',locale)} className={styles.secondary}>{t('goPayment')} <ArrowRight size={14}/></Link></aside></div></CheckoutShell>;
}
