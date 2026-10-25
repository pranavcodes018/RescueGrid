const {chromium}=require('playwright-core');
(async()=>{
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(600);
const out=await p.evaluate(()=>{
  const btns=[...document.querySelectorAll('header button')];
  return btns.map(e=>({cls:e.className.slice(0,120), disp:getComputedStyle(e).display}));
});
console.log(JSON.stringify(out,null,1));
await b.close();
})();
