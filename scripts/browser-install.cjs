async (page) => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const assert=(ok,message)=>{if(!ok)throw new Error(message);};
 await page.locator('main h1').waitFor();
 // Replace the real browser event with a controlled event; do not install on the test machine.
 async function prompt(outcome,fail=false){await page.evaluate(({outcome,fail})=>{
  window.installTestCalls=0;
  const event=new Event('beforeinstallprompt',{cancelable:true});
  event.prompt=async()=>{window.installTestCalls++;if(fail)throw new Error('Browser refused prompt');};
  event.userChoice=Promise.resolve({outcome});window.dispatchEvent(event);
 },{outcome,fail});}
 await prompt('dismissed');
 await page.getByRole('button',{name:'Download app',exact:true}).click();
 await page.getByRole('status').filter({hasText:'whenever you feel like it'}).waitFor();
 assert(await page.evaluate(()=>window.installTestCalls)===1,'Prompt not invoked once');
 await page.getByRole('button',{name:'Download app',exact:true}).click();
 await page.getByRole('dialog',{name:'Take Soft Day with you.'}).waitFor();
 await page.getByRole('button',{name:'Got it'}).click();
 await prompt('accepted',true);
 await page.getByRole('button',{name:'Download app',exact:true}).click();
 await page.getByRole('alert').waitFor();
 await page.keyboard.press('Escape');
 await page.getByRole('link',{name:'Profile',exact:true}).click();
 await page.getByRole('heading',{name:'A little closer, whenever you need it.'}).waitFor();
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow at '+width);
 }
 await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
 const violations=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>v.id);});
 assert(!violations.length,'Accessibility issues: '+violations);
 await prompt('accepted');
 await page.getByRole('button',{name:'Download app',exact:true}).nth(1).click();
 await page.getByRole('status').filter({hasText:'Your browser is adding'}).waitFor();
 await page.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));
 const buttons=page.getByRole('button',{name:'App installed',exact:true});
 await buttons.first().waitFor();
 assert(await buttons.count()===2,'Header and profile do not share install state');
 assert(await buttons.first().isDisabled()&&await buttons.nth(1).isDisabled(),'Installed buttons not disabled');
 assert(errors.length===0,'Runtime error: '+errors);
 return {dismissal:true,singleUsePrompt:true,fallbackDialog:true,promptFailure:true,accepted:true,installedState:true,widths:[390,768,1440],accessibility:violations,runtimeErrors:errors};
}
