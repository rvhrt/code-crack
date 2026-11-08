import {COOKIE_SYMBOLS,randomIndex,scoreGuess,makeMaze,moveInMaze} from './engine.js';
const $=id=>document.getElementById(id);
const format=ms=>`${String(Math.floor(ms/60000)).padStart(2,'0')}:${(ms/1000%60).toFixed(1).padStart(4,'0')}`;
let game='code',cookieAnswer=[],guess=[],cookieDone=false,cookieStarted=0,cookieFrame=0,guesses=0;
let maze,position,moves=0,mazeActive=false,mazeStarted=0,mazeFrame=0,tiltEnabled=false,lastTilt=0;
const tabs=[...document.querySelectorAll('[data-game]')];
function selectGame(next){
  if(game===next)return;
  cancelAnimationFrame(cookieFrame);cancelAnimationFrame(mazeFrame);
  if(cookieStarted&&!cookieDone){cookieDone=true;$('cookieStatus').textContent='Attempt ended when you changed games. Tap New hidden code to restart.';renderGuess();}
  if(mazeActive){mazeActive=false;$('mazeStatus').textContent='Attempt ended when you changed games. Tap Start maze to retry.';}
  game=next;
  tabs.forEach(tab=>{const selected=tab.dataset.game===game;tab.setAttribute('aria-pressed',String(selected));$(tab.getAttribute('aria-controls')).hidden=!selected;});
  $('settingsButton').hidden=game!=='code';
  document.dispatchEvent(new Event('gamechange'));
}
tabs.forEach(tab=>tab.addEventListener('click',()=>selectGame(tab.dataset.game)));
function renderGuess(){
  $('cookieEntry').replaceChildren(...Array.from({length:4},(_,i)=>{const el=document.createElement('span');el.textContent=guess[i]||'·';return el;}));
  $('cookieSubmit').disabled=cookieDone||guess.length!==4;
  $('cookieUndo').disabled=cookieDone||!guess.length;
  $('cookieKeys').querySelectorAll('button').forEach(b=>b.disabled=cookieDone||guess.length===4);
}
function tickCookie(){if(cookieDone||game!=='cookie')return;$('cookieTime').textContent=format(performance.now()-cookieStarted);cookieFrame=requestAnimationFrame(tickCookie);}
function addSymbol(symbol){
  if(cookieDone||guess.length===4)return;
  if(!cookieStarted){cookieStarted=performance.now();tickCookie();}
  guess.push(symbol);renderGuess();
}
for(const symbol of COOKIE_SYMBOLS){const button=document.createElement('button');button.textContent=symbol;button.setAttribute('aria-label',symbol==='◆'?'Logo symbol':symbol==='↑'?'Up arrow':symbol);button.addEventListener('click',()=>addSymbol(symbol));$('cookieKeys').append(button);}
function newCookie(){cancelAnimationFrame(cookieFrame);cookieAnswer=Array.from({length:4},()=>COOKIE_SYMBOLS[randomIndex(6)]);guess=[];cookieDone=false;cookieStarted=0;guesses=0;$('cookieHistory').replaceChildren();$('cookieCount').textContent='0 guesses';$('cookieTime').textContent=format(0);$('cookieStatus').textContent='Select a symbol to start the timer.';renderGuess();}
$('cookieUndo').onclick=()=>{guess.pop();renderGuess();};
$('cookieNew').onclick=newCookie;
$('cookieSubmit').onclick=()=>{
  if(cookieDone||guess.length!==4)return;
  const score=scoreGuess(cookieAnswer,guess),row=document.createElement('li');row.className='guess-row';
  score.forEach((result,i)=>{const el=document.createElement('span'),feedback=document.createElement('small');el.className=`guess-cell ${result}`;el.textContent=guess[i];feedback.textContent={exact:'✓',present:'↔',absent:'×'}[result];el.setAttribute('aria-label',`${guess[i]}: ${{exact:'correct position',present:'wrong position',absent:'no remaining match'}[result]}`);el.append(feedback);row.append(el);});
  $('cookieHistory').prepend(row);guesses++;$('cookieCount').textContent=`${guesses} guess${guesses===1?'':'es'}`;
  cookieDone=score.every(s=>s==='exact');
  if(cookieDone){cancelAnimationFrame(cookieFrame);$('cookieTime').textContent=format(performance.now()-cookieStarted);$('cookieStatus').textContent=`Combination cracked in ${guesses} guess${guesses===1?'':'es'}!`;}
  else{$('cookieStatus').textContent='Use your feedback to refine the next combination.';guess=[];}
  renderGuess();
};
const canvas=$('mazeCanvas'),ctx=canvas.getContext('2d');
function drawMaze(){
  const size=canvas.width/maze.width;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineWidth=3;ctx.strokeStyle='#bda1dc';
  ctx.fillStyle='#d5ff76';ctx.fillRect((maze.width-1)*size+10,(maze.height-1)*size+10,size-20,size-20);
  ctx.beginPath();
  maze.walls.forEach((row,y)=>row.forEach((walls,x)=>{const px=x*size,py=y*size;[[px,py,px+size,py],[px+size,py,px+size,py+size],[px,py+size,px+size,py+size],[px,py,px,py+size]].forEach(([x1,y1,x2,y2],d)=>{if(walls[d]){ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}});}));ctx.stroke();
  ctx.fillStyle='#fff8ed';ctx.beginPath();ctx.arc((position.x+.5)*size,(position.y+.5)*size,size*.23,0,Math.PI*2);ctx.fill();
}
function newMaze(){cancelAnimationFrame(mazeFrame);mazeActive=false;maze=makeMaze();position={x:0,y:0};moves=0;$('mazeMoves').textContent='0 moves';$('mazeTime').textContent=format(90000);$('mazeStatus').textContent='Tap Start maze. You have 90 seconds.';drawMaze();}
function tickMaze(){
  if(!mazeActive)return;
  const remaining=Math.max(0,90000-(performance.now()-mazeStarted));$('mazeTime').textContent=format(remaining);
  if(!remaining){mazeActive=false;$('mazeStatus').textContent='Time’s up. Tap Start maze to retry the same maze.';return;}
  mazeFrame=requestAnimationFrame(tickMaze);
}
function move(direction){
  if(!mazeActive)return;
  if(performance.now()-mazeStarted>=90000){tickMaze();return;}
  const next=moveInMaze(maze,position,direction);if(next===position)return;
  position=next;moves++;$('mazeMoves').textContent=`${moves} moves`;drawMaze();
  if(position.x===maze.width-1&&position.y===maze.height-1){mazeActive=false;cancelAnimationFrame(mazeFrame);const elapsed=performance.now()-mazeStarted;$('mazeTime').textContent=format(Math.max(0,90000-elapsed));$('mazeStatus').textContent=`Maze cleared in ${format(elapsed)} · ${moves} moves!`;}
}
$('mazeStart').onclick=()=>{cancelAnimationFrame(mazeFrame);position={x:0,y:0};moves=0;$('mazeMoves').textContent='0 moves';mazeActive=true;mazeStarted=performance.now();$('mazeStatus').textContent=tiltEnabled?'Tilt your phone towards the next passage.':'Reach the green exit before time runs out.';drawMaze();tickMaze();};
$('mazeNew').onclick=newMaze;
$('mazeControls').addEventListener('pointerdown',e=>{const button=e.target.closest('[data-direction]');if(!button||e.button>0)return;e.preventDefault();move(Number(button.dataset.direction));});
$('mazeControls').addEventListener('click',e=>{const button=e.target.closest('[data-direction]');if(button&&e.detail===0)move(Number(button.dataset.direction));});
$('mazeTilt').onclick=async()=>{
  if(tiltEnabled){tiltEnabled=false;$('mazeTilt').textContent='Enable tilt';return;}
  if(!window.DeviceOrientationEvent){$('mazeStatus').textContent='Tilt is unavailable here. Use the direction buttons.';return;}
  try{
    if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted')throw new Error('Permission declined');
    tiltEnabled=true;$('mazeTilt').textContent='Disable tilt';$('mazeStatus').textContent='Hold the phone roughly flat. Tilt to move; direction buttons also work.';
  }catch{$('mazeStatus').textContent='Tilt permission was unavailable. Use the direction buttons.';}
};
window.addEventListener('deviceorientation',e=>{
  if(!tiltEnabled||!mazeActive||game!=='maze'||e.beta===null||e.gamma===null)return;
  const now=performance.now();if(now-lastTilt<170)return;
  const angle=screen.orientation?.angle||0,radians=angle*Math.PI/180;
  const x=e.gamma*Math.cos(radians)+e.beta*Math.sin(radians),y=e.beta*Math.cos(radians)-e.gamma*Math.sin(radians);
  if(Math.max(Math.abs(x),Math.abs(y))<12)return;
  lastTilt=now;move(Math.abs(x)>Math.abs(y)?(x>0?1:3):(y>0?2:0));
});
document.addEventListener('keydown',e=>{if(game!=='maze'||/^(BUTTON|SELECT|INPUT|A|SUMMARY)$/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;const dir={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3}[e.key];if(dir!==undefined){e.preventDefault();move(dir);}});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)return;
  if(cookieStarted&&!cookieDone){cancelAnimationFrame(cookieFrame);cookieDone=true;$('cookieStatus').textContent='Attempt ended because you left the tab. Start a new hidden code.';renderGuess();}
  if(mazeActive){cancelAnimationFrame(mazeFrame);mazeActive=false;$('mazeStatus').textContent='Attempt ended because you left the tab. Tap Start maze to retry.';}
});
newCookie();newMaze();
