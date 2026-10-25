const {chromium}=require('playwright-core');
(async()=>{
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
console.log('innerWidth', await p.evaluate(()=>window.innerWidth));
const btns=await p.locator('header button').evaluateAll(els=>els.map(e=>({t:e.getAttribute('aria-label')||e.textContent.trim().slice(0,24), w:e.offsetWidth})));
console.log('BUTTONS', JSON.stringify(btns));
const info=await p.evaluate(()=>{
  const s=document.querySelector('#scenario-compact');
  const c=document.querySelector('header .app-topbar');
  return {selW: s?Math.round(s.getBoundingClientRect().width):null, headerW: c?Math.round(c.getBoundingClientRect().width):null};
});
console.log('INFO', JSON.stringify(info));
await b.close();
})();
