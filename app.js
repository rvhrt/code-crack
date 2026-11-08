import {Attempt,createSession,LABELS} from './engine.js';
const $=id=>document.getElementById(id);
let codes=[],attempt=null,active=false,startTime=0,frame=0,elapsed=0,errorTimeout;
const settings={length:6,rounds:1,mistake:'stay'};
const format=ms=>`${String(Math.floor(ms/60000)).padStart(2,'0')}:${(ms/1000%60).toFixed(1).padStart(4,'0')}`;
const key=()=>`codecrack:v1:${settings.length}:${settings.rounds}:${settings.mistake}`;
const readBest=()=>{try{return Number(localStorage.getItem(key()))||0;}catch{return 0;}};
function best(){const value=readBest();$('best').textContent=value?`BEST ${format(value)}`:'BEST —';}
function slots(container,values,position=-1){$(container).replaceChildren(...values.map((value,i)=>{const el=document.createElement('span');el.className='slot'+(value?.length===2?' shoulder':'')+(container==='target'&&i<position?' done':'')+(i===position?' current':'');el.textContent=LABELS[value]||'';return el;}));}
function render(){
  const r=attempt?.done?codes.length-1:attempt?.round||0;
  const current=codes[r];
  const p=attempt?.done?current.length:attempt?.position||0;
  document.documentElement.style.setProperty('--length',current.length>6?Math.ceil(current.length/2):current.length);
  slots('target',current,active?p:-1);
  slots('entry',current.map((s,i)=>i<p?s:null));
  $('round').textContent=`${Math.min((attempt?.round||0)+1,codes.length)} / ${codes.length}`;
  $('stage').textContent='FULL CONTROLLER';
  $('stageDetail').textContent=`${current.length} symbols · all twelve controls`;
  $('errors').textContent=attempt?.errors||0;
  const total=codes.reduce((sum,code)=>sum+code.length,0);
  const completed=attempt?.done?total:codes.slice(0,r).reduce((sum,code)=>sum+code.length,0)+p;
  $('progress').style.width=`${100*completed/total}%`;
  $('controller').querySelectorAll('button').forEach(b=>b.disabled=!active);
}
function stop(){active=false;cancelAnimationFrame(frame);}
function prepare(newCodes=true){stop();if(newCodes)({codes}=createSession(settings));attempt=new Attempt(codes,settings.mistake);elapsed=0;$('timer').textContent=format(0);$('start').textContent='START PRACTICE ↗';$('retry').disabled=true;$('status').textContent='Tap Start, then enter the code from left to right.';render();best();}
function tick(){if(!active)return;elapsed=performance.now()-startTime;$('timer').textContent=format(elapsed);frame=requestAnimationFrame(tick);}
function start(reuse=false){prepare(!reuse);active=true;startTime=performance.now();$('start').textContent='NEW ATTEMPT ↗';$('retry').disabled=false;$('status').textContent='Match the code. Keep your eyes up and your thumbs ready.';render();tick();}
function input(symbol){if(!active)return;const outcome=attempt.input(symbol);if(outcome==='wrong'){document.body.classList.remove('error');void document.body.offsetWidth;document.body.classList.add('error');clearTimeout(errorTimeout);errorTimeout=setTimeout(()=>document.body.classList.remove('error'),250);$('status').textContent=settings.mistake==='reset'?'Wrong input — current code restarted.':'Wrong input — try that position again.';if($('haptics').checked)navigator.vibrate?.(35);}else if(outcome==='finished'){elapsed=performance.now()-startTime;stop();$('timer').textContent=format(elapsed);const previous=readBest();if(!previous||elapsed<previous){try{localStorage.setItem(key(),String(elapsed));}catch{}}$('status').textContent=`Code cracked! ${format(elapsed)} · ${attempt.errors} error${attempt.errors===1?'':'s'}.`;$('start').textContent='GO AGAIN ↗';best();}else $('status').textContent=outcome==='next'?'Code cracked. Next code — keep going!':'Correct — keep going.';render();}
$('controller').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-input]');if(!b||b.disabled||e.button>0)return;e.preventDefault();input(b.dataset.input);});
// Keyboard/assistive activation emits a click without a pointer press.
$('controller').addEventListener('click',e=>{const b=e.target.closest('button[data-input]');if(b&&e.detail===0)input(b.dataset.input);});
$('start').onclick=()=>start();$('retry').onclick=()=>start(true);
$('settingsButton').onclick=()=>{if(active){stop();render();$('status').textContent='Attempt ended. Start a fresh attempt when ready.';}$('settings').showModal();};
$('settings').addEventListener('close',()=>{settings.length=Number($('length').value);settings.rounds=Number($('rounds').value);settings.mistake=$('mistake').value;prepare();});
const keys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',q:'L1',w:'L2',o:'R2',p:'R1',i:'triangle',j:'square',l:'circle',k:'cross'};
document.addEventListener('keydown',e=>{if($('codePanel').hidden||$('settings').open||/^(INPUT|SELECT|BUTTON|SUMMARY|A)$/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;const symbol=keys[e.key]||keys[e.key.toLowerCase()];if(symbol){e.preventDefault();if(!e.repeat)input(symbol);}else if(e.key==='Enter'&&!e.repeat){e.preventDefault();start();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active){stop();render();$('status').textContent='Attempt ended because you left the tab. Start again to record a time.';}});
prepare();

document.addEventListener('gamechange',()=>{if(active){stop();render();$('status').textContent='Attempt ended when you changed games. Start again when ready.';}});
