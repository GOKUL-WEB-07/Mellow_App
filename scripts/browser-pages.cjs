async (page) => {
 const base=page.url().split('#')[0];
 const errors=[];
 const badResponses=[];
 const onError=e=>errors.push(e.message);
 const onResponse=r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});};
 page.on('pageerror',onError);page.on('response',onResponse);
 const assert=(ok,message)=>{if(!ok)throw new Error(message);};
 try{
  await page.setViewportSize({width:430,height:932});
  await page.goto(base);
  await page.locator('main h1').waitFor();
  assert(page.url().endsWith('#/today'),'Home route did not open');
  assert(await page.getByRole('img',{name:/A quiet companion/}).evaluate(img=>img.complete&&img.naturalWidth>0),'Room art did not load');
  for(const route of ['Focus','Journal','Room','Profile','Today']){
   await page.getByRole('link',{name:route,exact:true}).click();
   await page.locator('main h1').waitFor();
   assert(page.url().includes('#/'+route.toLowerCase()),'Wrong route '+route);
   await page.reload();
   await page.locator('main h1').waitFor();
  }
  const manifest=await page.evaluate(async()=>await(await fetch('manifest.webmanifest')).json());
  assert(manifest.start_url==='/Mellow_App/'&&manifest.scope==='/Mellow_App/','Wrong PWA path');
  assert(manifest.icons.every(i=>i.src.startsWith('/Mellow_App/')),'Wrong icon paths');
  await page.evaluate(async()=>await navigator.serviceWorker.ready);
  await page.reload();
  await page.locator('main h1').waitFor();
  const scope=await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return r.scope;});
  assert(scope.endsWith('/Mellow_App/'),'Service worker escaped the project scope');
  await page.context().setOffline(true);
  await page.goto(base+'#/journal/new');
  await page.getByRole('heading',{name:'How did today feel?'}).waitFor();
  await page.getByRole('textbox',{name:'What stayed with you today?'}).fill('A quiet note, even offline.');
  await page.getByRole('button',{name:'Keep this memory'}).click();
  await page.reload();
  await page.getByRole('link').filter({hasText:'A quiet note, even offline.'}).waitFor();
  await page.context().setOffline(false);
  await page.getByRole('link',{name:'Today',exact:true}).click();
  await page.screenshot({path:'output/playwright/pages-mobile.png',fullPage:true});
  assert(!errors.length,JSON.stringify(errors));
  assert(!badResponses.length,JSON.stringify(badResponses));
  return {base,navigationAndRefresh:true,art:true,manifest:true,scope,offlineJournal:true,errors,badResponses};
 }finally{await page.context().setOffline(false);page.off('pageerror',onError);page.off('response',onResponse);}
}
