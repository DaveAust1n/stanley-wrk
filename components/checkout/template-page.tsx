import Link from 'next/link';
import {ArrowRight,Wallet} from 'lucide-react';
import {checkoutText,checkoutLocale,localeHref} from '../../lib/checkout-languages';
import {templateCopy,type PageTemplates,type TemplatePage} from '../../lib/page-templates';
import CheckoutShell from './shell';
import TrackingForm from './tracking-form';
import styles from './flow.module.css';

export default function TemplatePageView({page,settings,locale='en'}:{page:TemplatePage;settings?:PageTemplates;locale?:string}){
 const copy=templateCopy(settings,page,locale),t=checkoutText(checkoutLocale(locale));
 return <CheckoutShell active={page} locale={checkoutLocale(locale)}><h1 className={styles.title}>{copy.title}</h1>{copy.intro&&<p className={styles.subtitle}>{copy.intro}</p>}<div className={styles.grid}><section className={styles.card}><h2>{copy.heading}</h2>{copy.body&&<p>{copy.body}</p>}{page==='payment'?<><dl className={styles.rows}>{(['amount','currency','network','address'] as const).map(field=><div className={styles.row} key={field}><dt>{t(field)}</dt><dd>{t('unset')}</dd></div>)}</dl><div className={styles.notice} id="payment-notice">{t('notice')}</div><button className={styles.primary} disabled aria-describedby="payment-notice"><Wallet size={16}/>{t('disabled')}</button><Link className={styles.secondary} href={localeHref('/track',checkoutLocale(locale))}>{t('track')}<ArrowRight size={14}/></Link></>:<TrackingForm locale={checkoutLocale(locale)}/>}</section><aside className={`${styles.card} ${page==='payment'?styles.dark:''}`}><h2>{copy.sideTitle}</h2>{copy.sideBody&&<p>{copy.sideBody}</p>}{page==='track'&&<div className={styles.notice}>{t('trackNotice')}</div>}<Link className={styles.secondary} href={localeHref('/order',checkoutLocale(locale))}>Vehicle form<ArrowRight size={14}/></Link></aside></div></CheckoutShell>;
}
