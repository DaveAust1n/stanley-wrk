import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight,MapPin} from 'lucide-react';
import CheckoutShell from '../../components/checkout/shell';
import TrackingForm from '../../components/checkout/tracking-form';
import styles from '../../components/checkout/flow.module.css';
export const metadata:Metadata={title:'Track your order',description:'Use your unique tracking code to check your delivery.',robots:{index:false,follow:false}};
export default function TrackPage(){
 return <CheckoutShell active="track"><div className={styles.eyebrow}>Order tracking</div><h1 className={styles.title}>Your delivery.<br/>One simple code.</h1><p className={styles.subtitle}>Enter your tracking code to look up your order and the latest delivery update.</p><div className={styles.grid}><section className={styles.card} aria-labelledby="track-heading"><div className={styles.icon}><MapPin size={22}/></div><h2 id="track-heading">Find your order</h2><p>Keep your tracking code private.</p><TrackingForm/></section><aside className={styles.card}><h2>Need your tracking code?</h2><p>Your code will be provided after your payment has been verified. Save it so you can return to check your delivery.</p><div className={styles.notice}>Tracking is being set up. Delivery updates will appear here once your order is connected.</div><Link href="/payment" className={styles.secondary}>Go to payment <ArrowRight size={14}/></Link></aside></div></CheckoutShell>;
}
