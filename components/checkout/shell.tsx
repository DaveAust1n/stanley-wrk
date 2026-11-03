import LanguageSwitcher from '../studio/language-switcher';
import {checkoutLocales,checkoutText,checkoutDirection,localeHref,type CheckoutLocale} from '../../lib/checkout-languages';
import Link from 'next/link';
import {ArrowLeft,Package} from 'lucide-react';
import styles from './flow.module.css';
export default function CheckoutShell({active,children,locale='en'}:{active:'payment'|'track';children:React.ReactNode;locale?:CheckoutLocale}){
 const t=checkoutText(locale);
 return <div className={styles.page} lang={locale} dir={checkoutDirection(locale)}><header className={styles.header}><Link href={localeHref('/',locale)} className={styles.brand}><span className={styles.mark}><Package size={19}/></span><span>{t('brand')}</span></Link><nav className={styles.nav} aria-label={t('navLabel')}><Link href={localeHref('/order',locale)}>Vehicle form</Link><Link href={localeHref('/payment',locale)} className={active==='payment'?styles.active:undefined} aria-current={active==='payment'?'page':undefined}>{t('payment')}</Link><Link href={localeHref('/track',locale)} className={active==='track'?styles.active:undefined} aria-current={active==='track'?'page':undefined}>{t('track')}</Link></nav></header><main className={styles.main}>{children}</main><footer className={styles.footer}><Link href={localeHref('/',locale)}><ArrowLeft size={12} style={{display:'inline',verticalAlign:'middle',marginRight:7}}/>{t('back')}</Link><span>{t('footer')}</span></footer><LanguageSwitcher languages={[...checkoutLocales]} selected={locale}/></div>;
}
