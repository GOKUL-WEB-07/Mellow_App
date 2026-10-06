async (page) => {
 const assert=(ok,message)=>{if(!ok)throw new Error(message);};
 await page.clock.install();
 await page.getByLabel('Something warm',{exact:true}).selectOption('Matcha');
 for(const sound of ['Rain','Cafe','Fireplace','Forest','Ocean','Night','Soft wind']){
  await page.getByLabel('A sound to settle into').selectOption(sound);
  await page.getByRole('button',{name:'Play sound',exact:true}).click();
  await page.getByRole('button',{name:'Pause sound',exact:true}).waitFor();
  await page.getByRole('button',{name:'Pause sound',exact:true}).click();
 }
 await page.getByLabel('A sound to settle into').selectOption('Rain');
 await page.getByRole('slider').fill('20');
 await page.getByRole('button',{name:'Begin a quiet moment'}).click();
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const paused=await page.getByRole('timer').textContent();
 await page.clock.fastForward(60000);
 assert(await page.getByRole('timer').textContent()===paused,'Timer changed while paused');
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('soft-day:active')));
 await page.getByRole('button',{name:'5 min',exact:true}).nth(1).click();
 const added=await page.evaluate(()=>JSON.parse(localStorage.getItem('soft-day:active')));
 assert(added.remaining===before.remaining+300,'Add five minutes');
 await page.getByRole('button',{name:'5 min',exact:true}).nth(0).click();
 await page.reload();
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.clock.fastForward(65000);
 await page.getByRole('button',{name:'Finish early'}).click();
 await page.getByRole('heading',{name:'That was enough for now.'}).waitFor();
 await page.getByRole('button',{name:'A little closer',exact:true}).click();
 await page.getByLabel('A note, if you like').fill('The direction feels clearer.');
 await page.getByRole('button',{name:'Back to your day'}).click();
 await page.getByRole('link',{name:'Focus',exact:true}).click();
 await page.getByRole('button',{name:'Custom',exact:true}).click();
 await page.getByRole('spinbutton').fill('1');
 await page.getByRole('button',{name:'Begin a quiet moment'}).click();
 await page.clock.fastForward(61000);
 await page.getByRole('heading',{name:'That was enough for now.'}).waitFor();
 await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'Back to your day'}).click();
 await page.getByRole('button',{name:'Reopen finish',exact:true}).waitFor();
 await page.getByRole('link',{name:'Journal',exact:true}).click();
 console.log('PASS: seven audio controls, volume, tea, pause/resume, +/- time, reload, early finish, automatic completion and Done intention.');
}
