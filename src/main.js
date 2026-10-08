import {Game,terms} from './game.js';
import {stepBall,launchBall,chaosVelocity} from './physics.js';
const $=id=>document.getElementById(id), game=new Game(), court=$('court'), ball=$('ball'), canvas=$('effects'),ctx=canvas.getContext('2d');
const cup='<img src="/assets/coffee.svg" alt="">';
$('cup-stack').innerHTML=Array.from({length:10},(_,i)=>`<div class="cup-slot" data-cup="${i+1}">${cup}</div>`).join('');
let aim='right',scoreTimer,lastSpot=-1,lastColor=-1,welcome=true,lastMode=null,radius=48,chaosTimer=0,w=0,h=0,x=160,y=140,vx=0,vy=0,rotation=0,last=performance.now(), particles=[],trail=[],callTimer,burstTimer;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){const r=court.getBoundingClientRect(),oldW=w||r.width,oldH=h||r.height;w=r.width;h=r.height;radius=Math.max(27,Math.min(60,w*.045));ball.style.width=ball.style.height=radius*2+'px';x=Math.max(30,Math.min(w-30,x*w/oldW));y=Math.max(50,Math.min(h-100,y*h/oldH));const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0)}
new ResizeObserver(resize).observe(court);
function fitFrame(){const main=document.querySelector('main'),style=getComputedStyle(main),intro=document.querySelector('.intro'),controls=document.querySelector('.controls');const outerHeight=el=>{const css=getComputedStyle(el);return el.offsetHeight+parseFloat(css.marginTop)+parseFloat(css.marginBottom)};const availableHeight=window.innerHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-outerHeight(intro)-outerHeight(controls);const availableWidth=main.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);const width=Math.max(1,Math.min(1500,availableWidth,availableHeight*1366/768));main.style.setProperty('--frame-width',width+'px')}
window.addEventListener('resize',fitFrame);new ResizeObserver(fitFrame).observe(document.querySelector('.intro'));new ResizeObserver(fitFrame).observe(document.querySelector('.controls'));document.fonts.ready.then(fitFrame);fitFrame();

function sync(){
 const s=game.stage,mode=welcome?'welcome':game.mode;document.body.dataset.mode=mode;
 const overlay=$('overlay'),parent=mode==='break'?document.body:court;if(overlay.parentElement!==parent)parent.append(overlay);
 document.querySelector('main').inert=mode==='break';
 $('cups-count').textContent=game.cups;$('hit-count').textContent=String(game.hits).padStart(2,'0');$('energy-label').textContent=s.label;
 court.style.setProperty('--ball-color',s.color);$('ball-art').src=(game.cups<=2?'/assets/ball-gray.svg':game.cups<=6?'/assets/ball-green.svg':'/assets/ball-pink.svg');document.body.style.setProperty('--pink',game.cups>=7?(game.cups-6)/4:0);
 document.querySelectorAll('.cup-slot').forEach((el,i)=>el.classList.toggle('filled',i<game.cups));
 $('phase').textContent=mode==='play'?'IN PLAY / '+s.label:mode==='break'?'PAUSED':mode==='over'?'TRAINING COMPLETE':'READY TO SERVE';
 $('hit').hidden=!['play','break'].includes(mode);$('racket-controls').hidden=!['play','break'].includes(mode);$('break-label').hidden=mode!=='break';$('score').textContent=game.score;$('best-score').textContent=game.bestScore;$('end-score').hidden=mode!=='over';$('end-score').textContent=`Final score: ${game.score} · Best: ${game.bestScore}`;ball.hidden=['welcome','start','over'].includes(mode);overlay.hidden=mode==='play';$('love').hidden=game.cups!==10||mode!=='play';$('last-hits').hidden=game.cups!==10;$('last-hits').textContent=`${10-game.finalHits} HITS LEFT`;$('state-caption').textContent='CLICK HIT / PRESS SPACE';
 $('start-button').hidden=mode!=='welcome';$('dialog-title').hidden=mode==='welcome';$('dialog-title').textContent=mode==='start'?'Start with a coffee?':mode==='break'?'Coffee Break?':"Today’s training is over.";
 document.querySelector('.choices').hidden=!['start','break'].includes(mode);$('restart').hidden=mode!=='over';$('end-copy').hidden=mode!=='over';court.classList.toggle('game-over',mode==='over');court.classList.toggle('opening',['welcome','start'].includes(mode));
 if(mode==='break'){clearTimeout(callTimer);$('callout').classList.remove('pop')}
 if(mode!==lastMode){if(mode==='play'&&game.cups===10){$('love').classList.remove('love-pulse');void $('love').offsetWidth;$('love').classList.add('love-pulse')}lastMode=mode;if(mode==='break'||mode==='start')$('coffee-choice').focus({preventScroll:true});if(mode==='over')$('restart').focus({preventScroll:true})}
}
$('start-button').onclick=()=>{welcome=false;sync()};

function call(text){
 clearTimeout(callTimer);const el=$('callout');el.classList.remove('pop');el.textContent=text;
 const spots=[[.28,.2],[.72,.22],[.5,.37],[.3,.5],[.7,.5]],colors=['#edb3f4','#f9dc80','#bbf76d','#ffffff','#ff29d7'];
 const pick=(length,previous)=>(previous+1+Math.floor(Math.random()*(length-1)))%length;
 lastSpot=pick(spots.length,lastSpot);lastColor=pick(colors.length,lastColor);
 let size=Math.min(58,Math.max(16,w*.052));ctx.save();ctx.font=`${size}px Chalkduster`;size*=Math.min(1,w*.83/ctx.measureText(text).width);ctx.restore();el.style.fontSize=size+'px';
 el.style.color=colors[lastColor];el.style.setProperty('--tilt',(Math.random()*12-6)+'deg');
 el.style.left=spots[lastSpot][0]*100+'%';el.style.top=spots[lastSpot][1]*100+'%';
 const half=Math.min(w*.86,el.offsetWidth)/2;el.style.left=Math.max(half+8,Math.min(w-half-8,w*spots[lastSpot][0]))+'px';
 void el.offsetWidth;el.classList.add('pop');callTimer=setTimeout(()=>el.classList.remove('pop'),1600);
}

function emit(kind,count=14){for(let i=0;i<count;i++){particles.push({kind,x:Math.random()*w,y:kind==='heart'?-20:Math.random()*h*.5,vx:(Math.random()-.5)*60,vy:60+Math.random()*90,life:3+Math.random()*2,size:10+Math.random()*17,rot:Math.random()*6})}particles=particles.slice(-100)}
function choose(coffee){if(welcome||!game.choose(coffee))return;clearTimeout(callTimer);$('callout').classList.remove('pop');$('callout').textContent='';if(!vx&&!vy){x=w*.3;y=h*.36}sync();if(game.cups===10)emit('heart',35)}
function hit(){const result=game.hit(performance.now());if(!result)return;({vx,vy}=launchBall(aim,game.cups));rotation+=35;$('hit').classList.remove('pressed');void $('hit').offsetWidth;$('hit').classList.add('pressed');if(game.cups>=3&&game.cups<=4)emit('star');if(game.cups===10)emit('heart',10);if(result==='spin'){call('Stir × Spin');vx*=1.3;vy*=1.3}else if(result==='break'){vx=vy=0;}else if(result==='hit'&&game.hits%3===0)call(terms[Math.floor(Math.random()*terms.length)]);sync()}
$('coffee-choice').onclick=()=>choose(true);$('no-choice').onclick=()=>choose(false);$('hit').onclick=hit;
function reset(){welcome=true;aim='right';document.querySelectorAll('[data-direction]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.direction===aim)));clearTimeout(scoreTimer);$('score-flash').classList.remove('active');lastSpot=lastColor=-1;$('love').classList.remove('love-pulse');game.reset();vx=vy=0;particles=[];trail=[];clearTimeout(callTimer);$('callout').classList.remove('pop');sync()}
$('reset').onclick=reset;$('restart').onclick=reset;$('rules-button').onclick=()=>$('rules').showModal();$('close-rules').onclick=()=>$('rules').close();
function setAim(direction){if(game.mode!=='play'||welcome||$('rules').open)return;aim=direction;document.querySelectorAll('[data-direction]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.direction===aim)))}
document.querySelectorAll('[data-direction]').forEach(el=>el.onclick=()=>setAim(el.dataset.direction));
document.addEventListener('keydown',e=>{if(game.mode!=='play'||welcome||$('rules').open)return;const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(directions[e.code]){e.preventDefault();setAim(directions[e.code])}if(e.code==='Space'&&!e.repeat){e.preventDefault();hit()}});
function recordEdges(edges){if(!edges.length)return;const delta=game.scoreEdges(edges);$('score').textContent=game.score;$('best-score').textContent=game.bestScore;const flash=$('score-flash');flash.textContent=(delta>0?'+':'')+delta;flash.dataset.sign=delta>0?'positive':'negative';flash.classList.remove('active');void flash.offsetWidth;flash.classList.add('active');clearTimeout(scoreTimer);scoreTimer=setTimeout(()=>flash.classList.remove('active'),700);for(const edge of edges){const zone=document.querySelector('.edge-'+edge);zone.classList.remove('bounce');void zone.offsetWidth;zone.classList.add('bounce')}}

function frame(now){const dt=Math.min((now-last)/1000,.035);last=now;ctx.clearRect(0,0,w,h);if(game.mode==='play') {chaosTimer+=dt;
if(game.cups>=7&&chaosTimer>.16&&Math.hypot(vx,vy)>1){({vx,vy}=chaosVelocity(vx,vy,game.cups));chaosTimer=0}
const next=stepBall({x,y,vx,vy,radius,w,h},dt,game.cups);({x,y,vx,vy}=next);recordEdges(next.edges);rotation+=Math.hypot(vx,vy)*dt*(game.cups>=7?.8:.25);const jitter=game.cups>=7&&!reduced?(Math.random()-.5)*(game.cups-6)*10:0;const drawX=Math.max(radius,Math.min(w-radius,x+jitter)),drawY=Math.max(radius,Math.min(h-radius,y-jitter));ball.style.transform=`translate(${drawX-radius}px,${drawY-radius}px) rotate(${rotation}deg)`;if(!reduced&&Math.hypot(vx,vy)>100){trail.push({x,y});if(trail.length>9)trail.shift();trail.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle=game.stage.color;ctx.globalAlpha=i/trail.length*.16;ctx.arc(p.x,p.y,radius*.45+i,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1}else trail=[];
if(game.cups===10&&!reduced&&now-(burstTimer||0)>600){emit('heart',2);burstTimer=now}}
particles=particles.filter(p=>p.life>0);if(!reduced)for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;ctx.save();ctx.globalAlpha=Math.min(1,p.life);ctx.translate(p.x,p.y);ctx.rotate(Math.sin(now/900+p.rot)*.3);ctx.fillStyle=p.kind==='heart'?'#f442eb':'#f9dc80';ctx.font=`${p.size}px Chalkduster`;ctx.fillText(p.kind==='heart'?'♥':'✦',0,0);ctx.restore()}else particles=[];requestAnimationFrame(frame)}
sync();requestAnimationFrame(frame);
