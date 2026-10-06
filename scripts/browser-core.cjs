async (page) => {
 const assert=(ok,message)=>{if(!ok)throw new Error(message);};
 await page.getByRole('textbox',{name:'One meaningful thing'}).fill('Finish the homepage concept');
 await page.getByRole('button',{name:'Save intention'}).click();
 await page.getByRole('button',{name:'Add care',exact:true}).click();
 await page.getByRole('textbox',{name:'Something for yourself'}).fill('Take a walk before sunset');
 await page.getByRole('button',{name:'Save intention'}).click();
 await page.getByRole('button',{name:'Add enjoy',exact:true}).click();
 await page.getByRole('textbox',{name:'Just because it feels good'}).fill('Read a chapter of my book');
 await page.getByRole('button',{name:'Save intention'}).click();
 await page.getByRole('button',{name:'Take a walk before sunset'}).click();
 await page.getByRole('textbox',{name:'Something for yourself'}).fill('Take a slow walk before sunset');
 await page.getByRole('button',{name:'Save intention'}).click();
 await page.getByRole('button',{name:'Complete care',exact:true}).click();
 await page.getByRole('button',{name:'Complete enjoy',exact:true}).click();
 await page.reload();
 await page.getByRole('button',{name:'Reopen care',exact:true}).waitFor();
 assert(await page.getByRole('button',{name:'Take a slow walk before sunset'}).count()===1,'Intention edit persisted');
 await page.getByRole('button',{name:'Welcome to Soft Day'}).click();
 await page.getByRole('button',{name:'Begin',exact:true}).click();
 await page.getByLabel('Something warm',{exact:true}).selectOption('Masala chai');
 await page.getByRole('button',{name:'A little more'}).click();
 await page.getByRole('button',{name:'Make yourself at home'}).click();
 await page.getByRole('link',{name:'Start focus',exact:true}).click();
 console.log('PASS: create, edit, complete, reload persistence, onboarding and tea preference.');
}
