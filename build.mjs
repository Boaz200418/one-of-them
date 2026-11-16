import fs from 'fs';import vm from 'vm';import path from 'path';
const URL_=(process.env.SITE_URL||'https://oneofthem-group.com').replace(/\/$/,'');
const src=fs.readFileSync('src/index.html','utf8');
const js=src.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];
const d=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='classList'?{add(){},remove(){},toggle(){}}:d(),apply:()=>d(),set:()=>true});
const ctx=vm.createContext({document:{querySelector:d,querySelectorAll:()=>[]},location:{hash:''},addEventListener(){},scrollTo(){},encodeURIComponent,FormData:class{}});
vm.runInContext(js+';globalThis.X={R,S,SITE,M,URLS,svcPage}',ctx);
const {R,S,SITE,M,URLS,svcPage}=ctx.X;
const routes=[...Object.keys(R).map(k=>[k,k?URLS[k]||'Company Profile':'Home']),...S.map(x=>['services/'+x.s,x.t]),['gallery','Photo Gallery']];
const fix=h=>h.replace(/href="#\/subcontracting-form"/g,'href="/subcontracting/#subcontracting-form"').replace(/href="#\/([^"#]*)"/g,(m,p)=>`href="/${p?p+'/':''}"`);
const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
const org={"@context":"https://schema.org","@type":"Organization","name":SITE.name,"legalName":SITE.name,"url":URL_+"/","email":SITE.email,"telephone":["+27 60 111 0724","+27 61 687 8497"],"address":{"@type":"PostalAddress","addressLocality":"Cape Town","addressRegion":"Western Cape","addressCountry":"ZA"},"areaServed":{"@type":"City","name":"Cape Town","containedInPlace":{"@type":"AdministrativeArea","name":"Western Cape"}}};
const outDir=path.resolve('dist'),workspace=path.resolve('.');
if(!outDir.startsWith(workspace+path.sep))throw Error('Build output must stay inside the workspace');
if(fs.existsSync(outDir))for(const entry of fs.readdirSync(outDir,{withFileTypes:true}))fs.rmSync(path.join(outDir,entry.name),{recursive:true,force:true,maxRetries:5,retryDelay:100});
else fs.mkdirSync(outDir,{recursive:true});
const baseDesc=src.match(/<meta name="description" content="([^"]*)"/)[1];
function page(path,title,desc,html,crumbs,noindex){
 desc=desc.length>155?desc.slice(0,152).replace(/\s+\S*$/,'')+'…':desc;
 let o=src.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`)
 .replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${esc(desc)}">\n<meta name="geo.region" content="ZA-WC"><meta name="geo.placename" content="Cape Town, Western Cape, South Africa">\n<link rel="canonical" href="${URL_}${path}">${noindex?'<meta name="robots" content="noindex">':''}\n<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${URL_}${path}"><meta property="og:locale" content="en_ZA">`)
 .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify(org)}</script>`+(crumbs?`<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:crumbs.map((c,i)=>({"@type":"ListItem",position:i+1,name:c[0],item:URL_+c[1]}))})}</script>`:''))
 .replace('<main id="app"></main>',`<main id="app">${html}</main>`)
 .replace('addEventListener("hashchange",go);go();','wire();')
 .replace('formEndpoint:""','formEndpoint:"/api/enquiry"');
 return fix(o)}
const w=(f,c)=>{fs.mkdirSync(f.replace(/[^/]*$/,'')||'.',{recursive:true});fs.writeFileSync(f,c)};
const urls=[];
const images=fs.readdirSync('pictures',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>{const ext=path.extname(e.name).toLowerCase();const stem=path.basename(e.name,ext).normalize('NFKD').replace(/[^\w -]/g,'').trim().replace(/[\s_]+/g,'-').replace(/-+/g,'-').toLowerCase();return {source:e.name,file:stem+ext}});
fs.mkdirSync('dist/img',{recursive:true});for(const im of images)fs.copyFileSync(path.join('src/img',im.file),path.join('dist/img',im.file));
fs.mkdirSync('dist/docs',{recursive:true});fs.copyFileSync('src/docs/one-of-them-group-company-profile.pdf','dist/docs/one-of-them-group-company-profile.pdf');
const galleryItems=[
 ['branch removal.jpg','Branch removal','Tree Felling and Site Clearance','Careful removal of cut branches from a property.','/services/garden-tree-care/'],
 ['Commercial premises cleaning.jpg','Commercial premises cleaning','Cleaning','Cleaning equipment prepared for commercial premises cleaning.','/services/cleaning-services/'],
 ['Construction-site cleaning.jpg','Construction-site cleaning','Cleaning','Cleaning activity in an active construction environment.','/services/cleaning-services/'],
 ['customised modern Gate welding and metal repairs.jpg','Modern gate design','Welding and Metal Repairs','A contemporary metal gate installation example.','/services/welding-fabrication/'],
 ['Gate welding and metal repairs.jpg','Gate welding and metal repairs','Welding and Metal Repairs','Metal gate fabrication and repair example.','/services/welding-fabrication/'],
 ['Green-waste collection and removal coordination.jpg','Green-waste removal','Tree Felling and Site Clearance','Green waste collected for removal coordination.','/services/garden-tree-care/'],
 ['housecleaning.jpg','Residential cleaning','Cleaning','Cleaning equipment in use during a residential clean.','/services/cleaning-services/'],
 ['industrial painting.jpg','Industrial floor coating','Painting and Maintenance','A smooth coated floor in an industrial space.','/services/painting/'],
 ['labour0.jpg','Road and site support','Labour and Site Support','Workers carrying out road preparation and site support.','/services/labour-supply-site-support/'],
 ['labour2.jpg','Construction site assistance','Labour and Site Support','Construction workers assisting with building site activities.','/services/labour-supply-site-support/'],
 ['labour3.jpg','Building project support','Labour and Site Support','Workers and equipment at a building construction site.','/services/labour-supply-site-support/'],
 ['Move-in cleaning.jpg','Move-in cleaning','Cleaning','A clean residential interior prepared for a move.','/services/cleaning-services/'],
 ['move-out cleaning.jpg','Move-out cleaning','Cleaning','Residential cleaning in progress before a move.','/services/cleaning-services/'],
 ['Office cleaning.jpg','Office cleaning','Cleaning','Cleaning work in a modern office.','/services/cleaning-services/'],
 ['Painting of houses and commercial properties.jpg','House painting','Painting and Maintenance','A freshly painted residential property.','/services/painting/'],
 ['Painting of houses and commercial properties2.jpg','Commercial property painting','Painting and Maintenance','Painters working on a commercial exterior.','/services/painting/'],
 ['palm prunning.jpg','Palm pruning','Tree Felling and Site Clearance','A palm tree being pruned by a worker at height.','/services/garden-tree-care/'],
 ['plot clerearence.jpg','Plot clearance','Tree Felling and Site Clearance','Aerial view of a plot prepared for site clearance.','/services/garden-tree-care/'],
 ['Post-construction cleaning.jpg','Post-construction cleaning','Cleaning','Removal of dust and debris after construction work.','/services/cleaning-services/'],
 ['Removal of unwanted shrubs and growth.jpg','Vegetation removal','Tree Felling and Site Clearance','Cleared shrubs and vegetation collected for removal.','/services/garden-tree-care/'],
 ['Tree pruning and tree felling where appropriately equipped and authorised.jpg','Tree pruning','Tree Felling and Site Clearance','A tree worker pruning branches with safety equipment.','/services/garden-tree-care/']
].map(([source,title,category,caption,service])=>{const im=images.find(x=>x.source===source);if(!im)throw Error('Missing gallery source image: '+source);return {file:im.file,title,category,caption,service}});
const gallery=`<section><div class="w"><nav class="bc" aria-label="Breadcrumb"><a href="/">Home</a> / Photo Gallery</nav><h1>Service Photo Gallery</h1><p>Explore service-related photographs across cleaning, labour and site support, tree and site clearance, welding, and painting. Captions describe the scenes shown; they do not identify these as completed company projects.</p><div class="filters" aria-label="Filter gallery">${['All','Cleaning','Labour and Site Support','Tree Felling and Site Clearance','Welding and Metal Repairs','Painting and Maintenance'].map((v,i)=>`<button type="button" data-filter="${v}" aria-pressed="${i===0}">${v}</button>`).join('')}</div><div class="gallery-grid">${galleryItems.map((x,i)=>`<article class="gallery-card" data-category="${x.category}"><a href="/img/${x.file}" target="_blank" rel="noopener"><img src="/img/${x.file}" alt="${x.caption}" width="1280" height="960" ${i<3?'fetchpriority="high"':'loading="lazy"'}></a><div><p class="note">${x.category}</p><h2>${x.title}</h2><p>${x.caption}</p><a href="${x.service}">Explore related service &rarr;</a></div></article>`).join('')}</div><p class="row"><a class="btn" href="/contact/">Request a Quote</a></p></div></section><script>document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('.gallery-card').forEach(c=>c.hidden=b.dataset.filter!=='All'&&c.dataset.category!==b.dataset.filter)}));</script>`;
for(const [k,name] of routes){const sv=S.find(x=>'services/'+x.s===k);const path=k?'/'+k+'/':'/';
 const title=!k?'Property & Project Services Cape Town | '+SITE.short:k==='gallery'?'Cape Town Service Photo Gallery | '+SITE.short:sv?sv.t+' Cape Town | '+SITE.short:name+' Cape Town | '+SITE.short;
 const desc=k==='gallery'?'View service photos for cleaning, labour, tree care, welding and property support in Cape Town, Western Cape.':sv?sv.m+' Serving Cape Town, Western Cape.':(M[k]||baseDesc)+' Based in Cape Town, Western Cape, South Africa.';
 const crumbs=k?[['Home','/'],...(sv?[['Services','/services/']]:[]),[name,path]]:null;
 w('dist'+path+'index.html',page(path,title,desc,k==='gallery'?gallery:sv?svcPage(sv):R[k](),crumbs));urls.push(path)}
w('dist/404.html',page('/404.html','Page not found | '+SITE.short,'The page you requested could not be found.',`<section><div class="w"><h1>Page not found</h1><p><a href="#/">Return to the home page</a> or <a href="#/contact">contact us</a>.</p></div></section>`,null,true));
w('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${URL_}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
w('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${URL_}/sitemap.xml\n`);
console.log('built',urls.length,'pages for',URL_);
