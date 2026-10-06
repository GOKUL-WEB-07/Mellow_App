async (page) => {
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();
 await page.locator('main h1').waitFor();
 const controlled=await page.evaluate(()=>!!navigator.serviceWorker.controller);
 if(!controlled)throw new Error('Service worker did not control the production page');
 const manifest=await page.evaluate(async()=>await (await fetch('/manifest.webmanifest')).json());
 if(manifest.display!=='standalone'||manifest.icons.length<2)throw new Error('PWA manifest incomplete');
 await page.context().setOffline(true);
 const checks=[];
 try{
  for(const route of ['today','focus','journal','room','profile','history']){
   await page.goto('http://127.0.0.1:4173/'+route);
   await page.locator('main h1').waitFor();
   checks.push(route);
  }
  await page.getByRole('link',{name:'Today',exact:true}).click();
  const add=page.getByRole('button',{name:'Add finish',exact:true});
  if(await add.count())await add.click();else await page.getByRole('button',{name:'A little progress offline'}).click();
  await page.getByRole('textbox',{name:'One meaningful thing'}).fill('A little progress offline');
  await page.getByRole('button',{name:'Save intention'}).click();
  await page.reload();
  await page.getByRole('button',{name:'A little progress offline'}).waitFor();
  const imageLoaded=await page.getByRole('img',{name:/A quiet companion/}).evaluate(img=>img.complete&&img.naturalWidth>0);
  if(!imageLoaded)throw new Error('Room art unavailable offline');
  return {controlled,manifest:manifest.name,offlineRoutes:checks,offlineWriteAndReload:true,artCached:imageLoaded};
 }finally{await page.context().setOffline(false);}
}
