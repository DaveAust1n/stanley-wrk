// Campaign content is intentionally illustrative. Replace only with organiser-approved details.
export const campaign = { name:'METRO MOTORS', status:'CAMPAIGN PREVIEW', endDate:'', support:'Support contact to be provided', organiser:'Organiser to be confirmed', charge:'Not yet confirmed', purpose:'Charge purpose to be confirmed', currency:'', amount:'', crypto:'', network:'', wallet:'', confirmations:0, explorerTxBase:'', termsUrl:'', privacyUrl:'', social:{instagram:'', facebook:'', youtube:''}, accountImage:'', videoIds:['',''] };
export type Vehicle = { id:string; name:string; year:string; label:string; description:string; range:string; power:string; type:string; image:string; delivery:string; time:string };
export const vehicles: Vehicle[] = [
 {id:'urban',name:'Metro Urban',year:'Model year TBC',label:'POPULAR',description:'A refined everyday drive, designed for the journey ahead.',range:'Range TBC',power:'Power TBC',type:'Sedan',image:'',delivery:'Locations to be confirmed',time:'To be confirmed'},
 {id:'family',name:'Metro Family',year:'Model year TBC',label:'FAMILY SUV',description:'Room for more of life, with comfort for every passenger.',range:'Range TBC',power:'Power TBC',type:'SUV',image:'',delivery:'Locations to be confirmed',time:'To be confirmed'},
 {id:'grand',name:'Metro Grand',year:'Model year TBC',label:'PREMIUM',description:'A considered combination of presence, space and style.',range:'Range TBC',power:'Power TBC',type:'Premium',image:'',delivery:'Locations to be confirmed',time:'To be confirmed'}
];
export const updates=[{title:'The journey begins here',text:'Campaign announcement will appear here once approved.',date:'CAMPAIGN UPDATE'},{title:'More details coming soon',text:'Vehicle availability and campaign terms are being prepared.',date:'INFORMATION'}];
export const sampleActivity=[{name:'Alex M.',country:'Sample country',vehicle:'Metro Urban',status:'Claim received',time:'Sample entry'},{name:'Jordan K.',country:'Sample country',vehicle:'Metro Family',status:'Delivery scheduled',time:'Sample entry'},{name:'Sam T.',country:'Sample country',vehicle:'Metro Grand',status:'Vehicle dispatched',time:'Sample entry'}];
export const testimonials=['Placeholder for an approved customer story. No testimonial has been provided yet.','Your approved customer stories can be added here later.'];

export const sampleReviews = [
 {name:'James', message:'The website was easy to navigate.'},
 {name:'Sarah', message:'I liked being able to see the vehicle options.'},
 {name:'Daniel', message:'The claim steps were clear and simple.'},
 {name:'Amara', message:'The design looks clean on my phone.'}
];

export const vehicleReviews = [
 { id:'XTeWKmlNmN8', title:'Tesla Model 3 review', creator:'Edmunds Cars', url:'https://www.youtube.com/watch?v=XTeWKmlNmN8' },
 { id:'XDkzm_LR0Co', title:'Tesla Cybertruck review', creator:'Doug DeMuro', url:'https://www.youtube.com/watch?v=XDkzm_LR0Co' }
];

export const claimStatuses = ['Claim submitted','Under review','Approved','Awaiting payment','Payment confirmed','Preparing for delivery','Dispatched','Delivered'];
