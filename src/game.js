export const terms = ['Nice Shot !!!!!', 'Ace!', 'Advantage', 'Deuce!', 'Match Point', 'Game, Set, Sip!'];
export const stages = [
 {max:0,label:'NO CAFFEINE',copy:'',color:'#e0e2e0',speed:140,drag:1.3},
 {max:2,label:'WARMING UP',copy:'',color:'#e0e2e0',speed:250,drag:.45},
 {max:3,label:'FEELING THE BUZZ',copy:'',color:'#bbf76d',speed:440,drag:.06},
 {max:6,label:'THE SWEET SPOT',copy:'',color:'#bbf76d',speed:850,drag:0},
 {max:8,label:'TOO MUCH SPIN',copy:'',color:'#ff29d7',speed:1150,drag:0},
 {max:10,label:'LOVE YOU A LATTE',copy:'',color:'#ff29cc',speed:1450,drag:0},
];
export class Game {
 constructor(){this.reset()}
 reset(){this.score=0;this.bestScore=0;this.cups=0;this.hits=0;this.sinceBreak=0;this.outcome=null;this.mode='start';this.recent=[]}
 finish(outcome){if(this.mode==='over'||this.mode==='ending')return;this.outcome=outcome;this.mode=outcome==='perfect'?'over':'ending'}
 completeEnding(){if(this.mode==='ending')this.mode='over'}
 scoreEdges(edges){if(this.mode!=='play')return 0;const points={right:15,left:-15,top:5,bottom:-5};const delta=edges.reduce((sum,edge)=>sum+(points[edge]??0),0);this.score=Math.max(0,Math.min(1000,this.score+delta));this.bestScore=Math.max(this.bestScore,this.score);if(this.score>=1000)this.finish('perfect');else if(this.hits>0&&delta<0&&this.score===0)this.finish('love');return delta}
 get breakEvery(){return this.cups>=8?3:this.cups>=6?6:12}
 get stage(){return stages.find(s=>this.cups<=s.max)}
 choose(coffee){if(!['start','break'].includes(this.mode))return false;if(coffee)this.cups=Math.min(10,this.cups+1);this.sinceBreak=0;this.mode='play';if(this.cups===10)this.finish('caffeine');return true}
 hit(now){if(this.mode!=='play')return null;this.hits++;this.sinceBreak++;this.recent=this.recent.filter(t=>now-t<1100);this.recent.push(now);const spin=this.recent.length>=5;if(this.cups<10&&this.sinceBreak>=this.breakEvery){this.mode='break';return 'break'}return spin?'spin':'hit'}
}
