import fs from 'fs';import path from 'path';
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m)}};
const files=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?w(p):p.endsWith('.html')&&files.push(p)}})('dist');
const titles=new Set();
for(const f of files){const raw=fs.readFileSync(f,'utf8'),h=raw.replace(/<script[\s\S]*?<\/script>/g,'');
 ok((h.match(/<h1[ >]/g)||[]).length===1,f+' needs exactly one h1');
 const t=h.match(/<title>(.*?)<\/title>/)[1];ok(!titles.has(t),f+' duplicate title');titles.add(t);
 ok(/rel="canonical"/.test(h),f+' canonical');ok(!/href="#\//.test(h),f+' hash link');
 for(const m of h.matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)){const p=m[1];ok(fs.existsSync('dist'+p+(p.endsWith('/')?'index.html':'')),f+' broken link '+p)}}
const sm=fs.readFileSync('dist/sitemap.xml','utf8');ok(files.length-1===(sm.match(/<loc>/g)||[]).length,'sitemap count');
const gallery=fs.readFileSync('dist/gallery/index.html','utf8'),galleryHtml=gallery.replace(/<script[\s\S]*?<\/script>/g,'');
ok(files.includes(path.join('dist','gallery','index.html')),'gallery page exists');
ok((galleryHtml.match(/<h1[ >]/g)||[]).length===1,'gallery has one main H1');
ok(/<title>Service Photo Gallery \| ONE OF THEM GROUP<\/title>/.test(galleryHtml),'gallery title is appropriate');
ok(/<meta name="description" content="Browse service-related photographs/.test(galleryHtml),'gallery meta description is present');
ok(/<link rel="canonical" href="https:\/\/www\.example\.co\.za\/gallery\/">/.test(gallery),'gallery canonical is correct');
ok(sm.includes('https://www.example.co.za/gallery/'),'sitemap includes gallery');
ok(/data-filter="Cleaning"/.test(gallery)&&/data-filter="Painting and Maintenance"/.test(gallery),'gallery filter controls exist');
for(const m of galleryHtml.matchAll(/(?:href|src)="(\/[^"#]+)"/g)){const p=m[1];if(p.startsWith('/img/'))ok(fs.existsSync(path.join('dist',p.slice(1))),'gallery image exists '+p);else if(p.endsWith('/'))ok(fs.existsSync(path.join('dist',p.slice(1),'index.html')),'gallery internal link resolves '+p)}
for(const f of files){const raw=fs.readFileSync(f,'utf8');for(const m of raw.matchAll(/(?:src|href)="(\/img\/[^"#]+)"/g))ok(fs.existsSync(path.join('dist',m[1].slice(1))),f+' missing image '+m[1])}
const fn=(await import('./netlify/functions/enquiry.mjs')).default;
const post=(b)=>fn(new Request('http://x/api/enquiry',{method:'POST',body:JSON.stringify(b)}));
const good={type:'Quote request',fields:{name:'A',method:'Email',email:'a@b.co',service:'S',loc:'L',desc:'D',priv:'on'}};
ok((await post({...good,fields:{...good.fields,website:'spam'}})).status===400,'honeypot');
ok((await post({...good,fields:{...good.fields,desc:''}})).status===422,'missing field');
ok((await post({...good,fields:{...good.fields,priv:''}})).status===422,'consent');
delete process.env.RESEND_API_KEY;ok((await post(good)).status===503,'unconfigured must be 503');
Object.assign(process.env,{RESEND_API_KEY:'k',MAIL_TO:'t@x.co',MAIL_FROM:'f@x.co'});
globalThis.fetch=async()=>({ok:true});ok((await post(good)).status===200,'success path (mocked provider)');
globalThis.fetch=async()=>({ok:false});ok((await post(good)).status===502,'provider failure must not report success');
console.log(fail?fail+' FAILED':'all checks passed',files.length,'pages');process.exit(fail?1:0);
