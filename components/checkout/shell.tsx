import Link from 'next/link';
import {ArrowLeft,Package} from 'lucide-react';
import styles from './flow.module.css';
export default function CheckoutShell({active,children}:{active:'payment'|'track';children:React.ReactNode}){
 return <div className={styles.page}><header className={styles.header}><Link href="/site" className={styles.brand}><span className={styles.mark}><Package size={19}/></span><span>Payment & delivery</span></Link><nav className={styles.nav} aria-label="Payment and tracking"><Link href="/payment" className={active==='payment'?styles.active:undefined} aria-current={active==='payment'?'page':undefined}>Payment</Link><Link href="/track" className={active==='track'?styles.active:undefined} aria-current={active==='track'?'page':undefined}>Track order</Link></nav></header><main className={styles.main}>{children}</main><footer className={styles.footer}><Link href="/site"><ArrowLeft size={12} style={{display:'inline',verticalAlign:'middle',marginRight:7}}/>Back to website</Link><span>Payment & order tracking</span></footer></div>;
}
