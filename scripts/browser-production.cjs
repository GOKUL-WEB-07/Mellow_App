async (page) => {
 const errors=[];
 const listener=error=>errors.push(String(error));
 const consoleListener=message=>{if(message.type()==='error')errors.push(message.text());};
 page.on('pageerror',listener);page.on('console',consoleListener);
 try{
  await page.context().setOffline(false);
  for(const route of ['today','focus','journal','journal/new','room','profile','history']){
   await page.goto('http://127.0.0.1:4173/'+route);
   await page.locator('main h1').waitFor();
  }
  if(errors.length)throw new Error(JSON.stringify(errors));
  await page.goto('http://127.0.0.1:4173/today');
  return {productionRoutes:7,uncaughtErrors:errors,consoleErrors:0};
 }finally{page.off('pageerror',listener);page.off('console',consoleListener);}
}
