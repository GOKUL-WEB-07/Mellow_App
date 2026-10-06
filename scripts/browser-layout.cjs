async (page) => {
 const report=[];
 await page.getByLabel('What should we call you?').fill('River');
 await page.getByLabel('Your usual drink').selectOption('Chamomile');
 await page.getByLabel('A comfortable focus length').selectOption('15');
 await page.getByLabel('Light in your space').selectOption('Morning');
 await page.getByRole('checkbox',{name:/Less movement/}).check();
 await page.reload();
 if(await page.getByLabel('What should we call you?').inputValue()!=='River')throw new Error('Settings not persisted');
 for(const width of [390,768,1024,1280,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of ['today','focus','journal','room','profile','history']){
   await page.goto('http://127.0.0.1:5173/'+route);
   await page.locator('main h1').waitFor();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   if(overflow)throw new Error('Horizontal overflow: '+route+' at '+width);
   if(width===390||width===1440)await page.screenshot({path:'output/playwright/'+route+'-'+width+'.png',fullPage:true});
  }
  report.push('No overflow across six screens at '+width+'px');
 }
 await page.setViewportSize({width:390,height:844});
 for(const route of ['today','focus','journal','journal/new','room','profile','history']){
  await page.goto('http://127.0.0.1:5173/'+route);
  await page.locator('main h1').waitFor();
  await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
  const result=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
  report.push({route,violations:result});
 }
 console.log(JSON.stringify(report));
}
