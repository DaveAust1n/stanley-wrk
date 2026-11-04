import {cookies} from 'next/headers';
import {getIronSession} from 'iron-session';
import {AdminError} from './admin-contract';
export type AdminSession={adminCode?:string;expiresAt?:number};
export async function adminSession(){
 const password=process.env.ADMIN_SESSION_SECRET;
 if(!password||password.length<32)throw new AdminError(503,'The admin connection is not configured yet.');
 return getIronSession<AdminSession>(await cookies(),{password,cookieName:'stanley_admin_session',ttl:1800,cookieOptions:{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/'}});
}
export function sessionActive(session:AdminSession){return typeof session.adminCode==='string'&&!!session.adminCode&&typeof session.expiresAt==='number'&&session.expiresAt>Date.now();}
