import test from 'node:test';
import assert from 'node:assert/strict';
import {Attempt,generateCode,SYMBOLS,randomIndex} from './engine.js';
test('generator includes every controller input and permits repetitions',()=>{let i=0;assert.deepEqual(generateCode(12,()=>i++),SYMBOLS);assert.deepEqual(generateCode(6,()=>0),Array(6).fill('up'));for(let j=0;j<1000;j++)assert.ok(randomIndex(12)<12);});
test('mistake does not advance and completion cannot be entered twice',()=>{const a=new Attempt([['up','up']]);assert.equal(a.input('up'),'correct');assert.equal(a.input('down'),'wrong');assert.equal(a.position,1);assert.equal(a.errors,1);assert.equal(a.input('up'),'finished');assert.equal(a.input('up'),'ignored');});
test('reset rule restarts only current code and preserves errors',()=>{const a=new Attempt([['up'],['left','right']],'reset');assert.equal(a.input('up'),'next');a.input('left');assert.equal(a.input('up'),'wrong');assert.equal(a.round,1);assert.equal(a.position,0);a.input('left');assert.equal(a.input('right'),'finished');assert.equal(a.errors,1);});


test('fixed practice preserves configured length and count',async()=>{
 const {createSession}=await import('./engine.js');
 const {codes}=createSession({length:10,rounds:5},()=>0);
 assert.equal(codes.length,5);assert.ok(codes.every(c=>c.length===10));
});
test('cookie feedback counts duplicates only once and reserves exact matches',async()=>{
 const {scoreGuess}=await import('./engine.js');
 assert.deepEqual(scoreGuess(['A','B','X','Y'],['A','A','A','A']),['exact','absent','absent','absent']);
 assert.deepEqual(scoreGuess(['A','A','B','X'],['B','A','A','B']),['present','exact','present','absent']);
 assert.deepEqual(scoreGuess(['A','B','X','Y'],['A','B','X','Y']),['exact','exact','exact','exact']);
});
test('mazes have connected cells, reciprocal walls, closed boundaries and a reachable exit',async()=>{
 const {makeMaze,moveInMaze}=await import('./engine.js');
 for(let run=0;run<20;run++){
  const maze=makeMaze(),visited=new Set(['0,0']),queue=[{x:0,y:0}];
  while(queue.length){const p=queue.shift();for(let d=0;d<4;d++){
   const next=moveInMaze(maze,p,d);assert.ok(next.x>=0&&next.y>=0&&next.x<9&&next.y<9);
   if(next!==p){assert.equal(maze.walls[next.y][next.x][(d+2)%4],false);const key=`${next.x},${next.y}`;if(!visited.has(key)){visited.add(key);queue.push(next);}}
  }}
  assert.equal(visited.size,81);assert.ok(visited.has('8,8'));
 }
});
