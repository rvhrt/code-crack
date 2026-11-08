export const SYMBOLS = ['up','down','left','right','triangle','square','circle','cross','L1','L2','R2','R1'];
export const LABELS = {up:'↑',down:'↓',left:'←',right:'→',triangle:'△',square:'□',circle:'○',cross:'×',L1:'L1',L2:'L2',R2:'R2',R1:'R1'};
// Rejection sampling avoids modulo bias. Repeats are deliberately allowed.
export function randomIndex(size) {
  const bytes = new Uint32Array(1), limit = 2 ** 32 - (2 ** 32 % size);
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= limit);
  return bytes[0] % size;
}
export function generateCode(length, pick = randomIndex, pool = SYMBOLS) {
  return Array.from({length}, () => pool[pick(pool.length)]);
}
export class Attempt {
  constructor(codes, mistake = 'stay') { this.codes=codes; this.mistake=mistake; this.round=0; this.position=0; this.errors=0; this.done=false; }
  input(symbol) {
    if(this.done) return 'ignored';
    if(symbol !== this.codes[this.round][this.position]) { this.errors++; if(this.mistake==='reset') this.position=0; return 'wrong'; }
    this.position++;
    if(this.position < this.codes[this.round].length) return 'correct';
    this.round++; this.position=0;
    if(this.round===this.codes.length) { this.done=true; return 'finished'; }
    return 'next';
  }
}

export function createSession(settings, pick = randomIndex) {
  return {codes:Array.from({length:settings.rounds},()=>generateCode(settings.length,pick))};
}

export const COOKIE_SYMBOLS = ['A','B','X','Y','◆','↑'];
// Each answer occurrence can satisfy only one guess occurrence.
export function scoreGuess(answer,guess) {
  const result=guess.map((s,i)=>s===answer[i]?'exact':'absent');
  const remaining=new Map();
  answer.forEach((s,i)=>{if(result[i]!=='exact')remaining.set(s,(remaining.get(s)||0)+1);});
  guess.forEach((s,i)=>{if(result[i]!=='exact'&&(remaining.get(s)||0)>0){result[i]='present';remaining.set(s,remaining.get(s)-1);}});
  return result;
}
export function makeMaze(width=9,height=9,pick=randomIndex) {
  const walls=Array.from({length:height},()=>Array.from({length:width},()=>[true,true,true,true]));
  const seen=new Set(['0,0']),stack=[[0,0]],dirs=[[0,-1],[1,0],[0,1],[-1,0]];
  while(stack.length){
    const [x,y]=stack.at(-1);
    const options=dirs.map(([dx,dy],d)=>[x+dx,y+dy,d]).filter(([nx,ny])=>nx>=0&&ny>=0&&nx<width&&ny<height&&!seen.has(`${nx},${ny}`));
    if(!options.length){stack.pop();continue;}
    const [nx,ny,d]=options[pick(options.length)];
    walls[y][x][d]=false;walls[ny][nx][(d+2)%4]=false;seen.add(`${nx},${ny}`);stack.push([nx,ny]);
  }
  return {width,height,walls};
}
export function moveInMaze(maze,position,direction) {
  if(maze.walls[position.y][position.x][direction])return position;
  const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][direction];
  return {x:position.x+dx,y:position.y+dy};
}
