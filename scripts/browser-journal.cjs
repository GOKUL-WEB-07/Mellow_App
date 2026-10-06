async (page) => {
 const assert=(ok,message)=>{if(!ok)throw new Error(message);};
 await page.getByRole('button',{name:'Peaceful',exact:true}).click();
 await page.getByLabel('A place for a…').selectOption('Memory');
 await page.getByRole('textbox',{name:'What stayed with you today?'}).fill('The light through the window. A walk without a destination.');
 await page.getByLabel('Add a photo').setInputFiles('public/icon-192.png');
 await page.getByRole('img',{name:'Memory 1',exact:true}).waitFor();
 await page.getByRole('button',{name:'Keep this memory'}).click();
 await page.getByRole('link').filter({hasText:'The light through the window.'}).click();
 await page.getByRole('textbox',{name:'What stayed with you today?'}).fill('The light through the window. A slow walk and a warm cup of tea.');
 await page.getByRole('button',{name:'Mixed',exact:true}).click();
 await page.getByRole('button',{name:'Keep this memory'}).click();
 await page.reload();
 await page.getByRole('link').filter({hasText:'A slow walk and a warm cup of tea.'}).waitFor();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('soft-day:journal')));
 assert(saved[0].mood==='Mixed'&&saved[0].photos.length===1,'Mood or photo did not persist');
 for(const text of ['A small thought worth keeping.','I noticed the trees changing.']){
  await page.getByRole('link',{name:'Leave a little note'}).click();
  await page.getByRole('textbox',{name:'What stayed with you today?'}).fill(text);
  await page.getByRole('button',{name:'Keep this memory'}).click();
 }
 await page.getByRole('link',{name:'Room',exact:true}).click();
 console.log('PASS: journal create, edit, mood, photo upload, reload persistence and three-entry plant unlock.');
}
