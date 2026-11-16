// Server-side validation + email via Resend. Env: RESEND_API_KEY, MAIL_TO, MAIL_FROM (verified sender). Never exposed to the browser.
const REQ={"Quote request":["name","method","service","loc","desc"],"Subcontracting enquiry":["name","company","email","phone","service","loc","desc"]};
const j=(s,o)=>new Response(JSON.stringify(o),{status:s,headers:{"Content-Type":"application/json"}});
export default async (req)=>{
 if(req.method!=="POST")return j(405,{error:"Method not allowed"});
 let b;try{b=await req.json()}catch{return j(400,{error:"Invalid request"})}
 const f=b&&b.fields,t=b&&b.type;
 if(!f||!REQ[t])return j(400,{error:"Invalid request"});
 if(f.website)return j(400,{error:"Rejected"}); // spam trap: no email sent
 for(const k of REQ[t])if(!String(f[k]||"").trim())return j(422,{error:"Missing "+k});
 if(!f.priv)return j(422,{error:"Privacy consent required"});
 if(f.email&&!/^\S+@\S+\.\S+$/.test(f.email))return j(422,{error:"Invalid email"});
 if(f.method==="Email"&&!f.email)return j(422,{error:"Email required"});
 const body=Object.entries(f).filter(([k,v])=>v&&k!=="website"&&k!=="priv").map(([k,v])=>k+": "+String(v).slice(0,2000)).join("\n");
 const {RESEND_API_KEY:K,MAIL_TO:to,MAIL_FROM:from}=process.env;
 if(!K||!to||!from)return j(503,{error:"Email delivery not configured"});
 try{const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+K,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],reply_to:f.email||undefined,subject:"Website: "+t+" from "+String(f.name).slice(0,80),text:body})});
  if(!r.ok)return j(502,{error:"Email provider rejected the message"});return j(200,{ok:true})}catch{return j(502,{error:"Email provider unreachable"})}};
export const config={path:"/api/enquiry"};
