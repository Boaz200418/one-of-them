import fs from 'node:fs';
import path from 'node:path';

let fail=0;
const ok=(condition,message)=>{if(!condition){fail++;console.error('FAIL',message)}};
const htmlFiles=[];
(function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);entry.isDirectory()?walk(file):file.endsWith('.html')&&htmlFiles.push(file)}})('dist');

const expectedHost='https://oneofthem-group.com';
const netlifyConfig=fs.readFileSync('netlify.toml','utf8');
ok(netlifyConfig.includes('command = "node build.mjs"'),'Netlify build command is configured');
ok(netlifyConfig.includes('publish = "dist"'),'Netlify publish directory is configured');
ok(netlifyConfig.includes('SITE_URL = "https://oneofthem-group.com"'),'Netlify production site URL is configured');
ok(netlifyConfig.includes('pretty_urls = true'),'Netlify serves canonical clean page URLs');
ok(netlifyConfig.includes('directory = "netlify/functions"'),'Netlify functions directory is configured');
const publishedPages=htmlFiles.filter(file=>!file.endsWith(`${path.sep}404.html`));
ok(publishedPages.length===18,'the build should generate exactly 18 public pages');
const titles=new Set(),descriptions=new Set();
for(const file of htmlFiles){
  const raw=fs.readFileSync(file,'utf8');
  const html=raw.replace(/<script[\s\S]*?<\/script>/g,'');
  const title=html.match(/<title>(.*?)<\/title>/)?.[1]||'';
  const description=html.match(/<meta name="description" content="(.*?)">/)?.[1]||'';
  const rel=path.relative('dist',file).split(path.sep).join('/');
  const canonicalPath=rel==='index.html'?'/':`/${rel.replace(/index\.html$/,'')}`;
  ok((html.match(/<h1[ >]/g)||[]).length===1,`${rel} should have exactly one H1`);
  ok(title.length>0&&!titles.has(title),`${rel} needs a unique title`);titles.add(title);
  ok(description.length>0&&description.length<=160&&!descriptions.has(description),`${rel} needs a unique concise meta description`);descriptions.add(description);
  ok(html.includes(`rel="canonical" href="${expectedHost}${canonicalPath}"`),`${rel} canonical URL is incorrect`);
  ok(!/name="robots" content="noindex"/.test(html)||rel==='404.html',`${rel} has an unintended noindex`);
  ok(html.includes('name="geo.region" content="ZA-WC"'),`${rel} is missing Western Cape metadata`);
  ok(html.includes(`property="og:image" content="${expectedHost}/img/one-of-them-group-social-card.png"`),`${rel} is missing its absolute social image`);
  ok(html.includes('name="twitter:card" content="summary_large_image"'),`${rel} is missing Twitter card metadata`);
  ok(html.includes('rel="icon" type="image/svg+xml" href="/favicon.svg"'),`${rel} is missing the branded favicon`);
  ok(raw.includes('@media(max-width:400px){#wa{position:static;display:flex;')&&raw.includes('min-width:48px;min-height:48px;'),`${rel} WhatsApp CTA avoids overlay and remains a 48px tap target on small screens`);
  ok(raw.includes('calc(16px + env(safe-area-inset-bottom,0px))'),`${rel} WhatsApp CTA reserves mobile safe-area space`);
  ok(raw.includes('env(safe-area-inset-right,0px)'),`${rel} mobile WhatsApp CTA reserves the right safe area`);
  ok(raw.includes('@media(max-width:340px){header .w{gap:8px}'),`${rel} narrow mobile header keeps its menu inside the viewport`);
  ok(raw.includes('id="wa"')&&raw.includes('aria-label="Chat with us on WhatsApp"'),`${rel} WhatsApp CTA is present and accessible`);
  ok(raw.indexOf('</footer>')>=0&&raw.indexOf('</footer>')<raw.indexOf('<a id="wa"'),`${rel} WhatsApp CTA follows the footer in document flow`);
  ok(raw.includes('application/ld+json'),`${rel} is missing structured data`);
  for(const tag of html.matchAll(/<img\b[^>]*>/g))ok(/\balt="[^"]*"/.test(tag[0]),`${rel} has an image without alt text`);
  for(const m of html.matchAll(/href="(\/[^"]*)"/g)){
    const local=m[1].split('#')[0];if(!local)continue;
    const target=local.endsWith('/')?path.join('dist',local,'index.html'):path.join('dist',local);
    ok(fs.existsSync(target),`${rel} has a broken local link ${local}`);
  }
  for(const m of raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    try{JSON.parse(m[1])}catch{ok(false,`${rel} has invalid JSON-LD`)}
  }
}
ok(htmlFiles.length===publishedPages.length+1,'one 404 document should be excluded from sitemap');
const home=fs.readFileSync('dist/index.html','utf8');
ok(home.includes('<title>Property &amp; Project Services in Cape Town | ONE OF THEM GROUP</title>'),'homepage title follows brief');
ok(home.includes('ONE OF THEM GROUP provides labour supply, cleaning, property maintenance, garden services and subcontracting support across Cape Town and the Western Cape.'),'homepage description follows brief');
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),'sitemap has XML declaration');
ok(!/example\.co\.za|example\.com/.test(sitemap),'sitemap has no placeholder domains');
const sitemapUrls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
ok(sitemapUrls.length===publishedPages.length,'sitemap includes every canonical page exactly once');
ok(sitemapUrls.every(url=>url.startsWith(expectedHost+'/')),'sitemap uses the canonical HTTPS domain');
for(const url of sitemapUrls){const pathname=new URL(url).pathname;const target=path.join('dist',pathname,'index.html');ok(fs.existsSync(target),`sitemap URL resolves to a built page: ${url}`)}
const robots=fs.readFileSync('dist/robots.txt','utf8');
ok(/^User-agent: \*\s+Allow: \/\s+Sitemap: https:\/\/oneofthem-group\.com\/sitemap\.xml\s*$/m.test(robots),'robots.txt allows public pages and points to the canonical sitemap');
ok(fs.existsSync('dist/img/one-of-them-group-social-card.png'),'social image is copied into the build');
for(const image of fs.readdirSync('src/img'))ok(fs.existsSync(path.join('dist/img',image)),`image asset is copied into the build: ${image}`);
ok(fs.existsSync('dist/favicon.svg'),'branded favicon is copied into the build');
ok(fs.existsSync('dist/docs/one-of-them-group-company-profile.pdf'),'company profile download exists');
ok(fs.readFileSync('src/docs/one-of-them-group-company-profile.pdf').equals(fs.readFileSync('dist/docs/one-of-them-group-company-profile.pdf')),'corrected company profile is copied unchanged into dist');
const docs=fs.readFileSync('dist/documents/index.html','utf8');
ok(docs.includes('href="/docs/one-of-them-group-company-profile.pdf" download'),'document library has a working profile download');
ok(fs.readFileSync('dist/company-profile/index.html','utf8').includes('href="/docs/one-of-them-group-company-profile.pdf" download'),'company profile route links directly to its download');
ok(home.includes('formEndpoint:"/api/enquiry"'),'generated forms target the Netlify enquiry endpoint');
ok(!htmlFiles.map(file=>fs.readFileSync(file,'utf8')).join('').includes('RESEND_API_KEY'),'Resend credentials are not exposed in generated pages');
const group=fs.readFileSync('dist/group/index.html','utf8');
for(const type of ['Organization','WebSite','WebPage','BreadcrumbList'])ok(group.includes(`"@type":"${type}"`),`group page has ${type} structured data`);
for(const slug of ['labour-supply-site-support','garden-tree-care'])ok(fs.readFileSync(`dist/services/${slug}/index.html`,'utf8').includes('"@type":"Service"'),`${slug} has Service structured data`);
for(const slug of ['cleaning-services','welding-fabrication','renovations-maintenance'])ok(fs.readFileSync(`dist/services/${slug}/index.html`,'utf8').includes('Developing service offering'),`${slug} is labelled as developing`);
const painting=fs.readFileSync('dist/services/painting/index.html','utf8');
ok(painting.includes('COMING SOON')&&painting.includes('not currently available for booking'),'painting is clearly marked coming soon');

const fnModule=await import('./netlify/functions/enquiry.mjs');
const fn=fnModule.default;
ok(fnModule.config?.path==='/api/enquiry','Netlify enquiry function is mounted at /api/enquiry');
ok((await fn(new Request('http://localhost/api/enquiry'))).status===405,'enquiry endpoint rejects non-POST methods');
ok((await fn(new Request('http://localhost/api/enquiry',{method:'POST',body:'{'}))).status===400,'enquiry endpoint rejects malformed JSON');
const post=body=>fn(new Request('http://localhost/api/enquiry',{method:'POST',body:JSON.stringify(body)}));
const good={type:'Quote request',fields:{name:'A',method:'Email',email:'a@b.co',service:'S',loc:'L',desc:'D',priv:'on'}};
ok((await post({...good,type:'Unknown request'})).status===400,'enquiry endpoint rejects unknown form types');
ok((await post({...good,fields:{...good.fields,website:'spam'}})).status===400,'honeypot');
ok((await post({...good,fields:{...good.fields,desc:''}})).status===422,'missing field');
ok((await post({...good,fields:{...good.fields,priv:''}})).status===422,'consent');
ok((await post({...good,fields:{...good.fields,email:'not-an-email'}})).status===422,'invalid email');
delete process.env.RESEND_API_KEY;ok((await post(good)).status===503,'unconfigured service must return 503');
Object.assign(process.env,{RESEND_API_KEY:'k',MAIL_TO:'t@x.co',MAIL_FROM:'f@x.co'});
globalThis.fetch=async()=>({ok:true});ok((await post(good)).status===200,'success path (mocked provider)');
globalThis.fetch=async()=>({ok:false});ok((await post(good)).status===502,'provider failure must not report success');

console.log(fail?`${fail} checks failed`:`all checks passed: ${publishedPages.length} pages, sitemap, metadata, structured data, links, images, documents and enquiry function`);
process.exit(fail?1:0);
