async (page) => {
 const report=[];
 for(const theme of ['Morning','Evening','Night']){
  await page.goto('http://127.0.0.1:5173/profile');
  await page.getByLabel('Light in your space').selectOption(theme);
  for(const route of ['today','focus','journal','journal/new','room','profile','history']){
   await page.goto('http://127.0.0.1:5173/'+route);
   await page.locator('main h1').waitFor();
   await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
   const violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
   report.push({theme,route,violations});
  }
 }
 return report;
}
