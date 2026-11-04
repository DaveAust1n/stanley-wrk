import AdminWorkspace from '../../components/admin/admin-workspace';
import {adminSession,sessionActive} from '../../lib/admin-session';
import {adminConfigured} from '../../lib/admin-backend';
export const dynamic='force-dynamic';
export const metadata={title:'Payment administration · Metro Studio',robots:{index:false,follow:false}};
export default async function AdminPage(){const configured=adminConfigured();let signedIn=false;if(configured)signedIn=sessionActive(await adminSession());return <AdminWorkspace initiallySignedIn={signedIn} configured={configured}/>;}
