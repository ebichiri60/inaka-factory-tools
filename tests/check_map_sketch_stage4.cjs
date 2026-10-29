const fs=require('fs'),vm=require('vm');
const file=require('path').join(__dirname,'..','map_sketch_stage4.html');
const html=fs.readFileSync(file,'utf8'), script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
class Element { constructor(){this.value='';this.style={};this.dataset={};this.children=[];this.classList={add(){},remove(){},toggle(){}};this.width=960;this.height=540;this.childElementCount=0;} append(...a){this.children.push(...a);this.childElementCount=this.children.length} appendChild(a){this.append(a);return a} replaceChildren(...a){this.children=a;this.childElementCount=a.length} addEventListener(){} insertAdjacentHTML(){} setAttribute(){} getContext(){return new Proxy({measureText:()=>({width:0})},{get:(o,k)=>o[k]||(()=>{})})} getBoundingClientRect(){return {width:960,height:540,left:0,top:0}} querySelector(){return new Element()} querySelectorAll(){return []} closest(){return this} remove(){} }
const elements=new Map(), document={getElementById(id){if(!elements.has(id))elements.set(id,new Element());return elements.get(id)},createElement(){return new Element()},querySelectorAll(){return []},addEventListener(){},body:new Element()};
document.getElementById('camZoom').value='1';const memory=new Map();const storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const ctx={Image:class{},document,localStorage:storage,console,Uint8Array,Map,Set,Math,Date,JSON,Number,String,Array,Object,Boolean,RegExp,parseInt,parseFloat,isFinite,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},ResizeObserver:class{observe(){}},window:{addEventListener(){},devicePixelRatio:1},navigator:{},Blob:class{},URL:{createObjectURL:()=>'',revokeObjectURL(){}}};ctx.window.window=ctx.window;vm.createContext(ctx);
try{vm.runInContext(script,ctx,{timeout:10000});const r=vm.runInContext('window.runMapSketchSelfTest()',ctx,{timeout:10000});console.log(JSON.stringify({selftest:r}));if(!r.ok)process.exitCode=1;}catch(e){console.log(JSON.stringify({error:String(e),stack:String(e.stack).split("\n").slice(-4).join("\n")}));process.exitCode=1}



const extra=vm.runInContext(`(()=>{const ids=['estate_trial','corridor_trial','village_trial','station_trial','town_trial'];const saved={};const checks=[];for(const id of ids){openConsideration(id);tileEdits.set(W+1,KIND_INDEX.w);document.getElementById('note').value=id;saved[id]=JSON.stringify(serialize());}for(const id of ids){openConsideration('legacy');deserialize(JSON.parse(saved[id]));checks.push({id,ok:boardId===id&&tileEdits.get(W+1)===KIND_INDEX.w&&document.getElementById('note').value===id});}deserialize({name:'range',board:{id:'corridor_trial',w:28,h:20,ox:4300,oy:1000},tiles:'4328,1000,water;4299,1001,road',markers:[]});const range=[...tileEdits.entries()].map(([i,k])=>({i,x:i%W+OX,y:Math.floor(i/W)+OY,kind:KINDS[k].id}));let badJson;try{JSON.parse('{bad');badJson='accepted'}catch(e){badJson='rejected'}let badShape;try{deserialize({tiles:{bad:1}});badShape='accepted'}catch(e){badShape=String(e)};return {checks,range,badJson,badShape};})()`,ctx,{timeout:10000});console.log(JSON.stringify({extra}));

const n=vm.runInContext(`(()=>{
const checks=[];const ok=(name,v)=>checks.push({name,ok:!!v});
const ix=(x,y)=>(y-OY)*W+x-OX;
openConsideration('corridor_trial');document.getElementById('brush').value='1';
beginStroke();tool='walk_yes';applyBrush(2,3);endStroke();
beginStroke();tool='rail_v';applyBrush(3,3);endStroke();
const oldX=OX+2,oldY=OY+3;tileEdits.set(ix(oldX,oldY),KIND_INDEX.r); treeEdits.set(ix(oldX,oldY),true); wallEdits.add(ix(oldX,oldY));sideEdits.add(3*(W+1)+2);backEdits.add(3*W+2);
frameEdits.set('path',{x:4303,y:1013.5,w:12,h:3});
growBoard(2,3,4,5);
ok('grow dimensions',OX===4298&&OY===997&&W===34&&H===28);
ok('grow coordinates',tileEdits.get(ix(oldX,oldY))===KIND_INDEX.r && treeEdits.get(ix(oldX,oldY))===true && wallEdits.has(ix(oldX,oldY)) && sideEdits.has(6*(W+1)+4) && backEdits.has(6*W+4));
ok('layers stay absolute',walkEdits.get('4302,1003')==='yes'&&barrierEdits.get('4303,1003')==='rail_v'&&frameEdits.get('path').x===4303);
tool='paint';kind=KIND_INDEX.w;beginStroke();applyBrush(0,0);endStroke();
const saved=serialize();ok('expanded save',saved.board.expanded&&saved.tiles.includes('4298,997,water')&&saved.walk.includes('4302,1003,yes'));
openConsideration('estate_trial');deserialize(saved);
ok('expanded reload',OX===4298&&OY===997&&W===34&&H===28&&tileEdits.get(ix(4298,997))===KIND_INDEX.w&&tileEdits.get(ix(oldX,oldY))===KIND_INDEX.r&&walkEdits.get('4302,1003')==='yes'&&barrierEdits.get('4303,1003')==='rail_v'&&frameEdits.get('path').x===4303);
let prev=JSON.stringify({...serialize(),updatedAt:''});let rejected=false;try{deserialize({...saved,walk:'4297,997,yes'})}catch(e){rejected=true};ok('invalid keeps edits',rejected&&JSON.stringify({...serialize(),updatedAt:''})===prev);
rejected=false;try{deserialize({...saved,frames:[{id:'path',x:0,y:0,w:1,h:1}]})}catch(e){rejected=true};ok('bad frame keeps edits',rejected&&JSON.stringify({...serialize(),updatedAt:''})===prev);
rejected=false;try{growBoard(129,0,0,0)}catch(e){rejected=true};ok('growth limit',rejected&&W===34);
openConsideration('corridor_trial');beginStroke();tool='walk_no';applyBrush(1,1);cancelStroke();ok('cancel layer',walkEdits.size===0);
beginStroke();tool='fence_h';applyBrush(1,1);endStroke();ok('fence separate',barrierEdits.get('4301,1001')==='fence_h'&&walkEdits.size===0);undo();ok('undo fence',barrierEdits.size===0);
tileEdits.set(ix(4302,1003),KIND_INDEX.r);growBoard(2,1,0,0);undo();ok('undo growth',OX===4300&&OY===1000&&W===28&&tileEdits.get(ix(4302,1003))===KIND_INDEX.r);
return checks;})()`,ctx,{timeout:10000});console.log(JSON.stringify({newchecks:n}));if(n.some(x=>!x.ok))process.exitCode=1;
if(extra.checks.some(x=>!x.ok)||extra.range.length!==0||extra.badJson!=='rejected'||extra.badShape==='accepted')process.exitCode=1;

const more=vm.runInContext(`(()=>{let a=[];const t=(n,v)=>a.push({name:n,ok:!!v});document.getElementById('brush').value='1';openConsideration('corridor_trial');
beginStroke();tool='fence_v';lineTiles({x:1,y:1},{x:1,y:4},(x,y)=>applyBrush(x,y));endStroke();t('fence line',barrierEdits.size===4&&[...barrierEdits.values()].every(v=>v==='fence_v'));
beginStroke();tool='barrier_clear';applyBrush(1,2);endStroke();t('erase one',barrierEdits.size===3);undo();t('undo erase',barrierEdits.size===4);
beginStroke();tool='walk_yes';applyBrush(1,1);endStroke();beginStroke();tool='walk_no';applyBrush(2,1);endStroke();t('walk independent',walkEdits.get('4301,1001')==='yes'&&walkEdits.get('4302,1001')==='no'&&barrierEdits.size===4);
beginStroke();tool='walk_clear';applyBrush(1,1);endStroke();t('walk clear',!walkEdits.has('4301,1001'));undo();t('undo walk clear',walkEdits.get('4301,1001')==='yes');
openConsideration('legacy');tileEdits.set(0,KIND_INDEX.w);growBoard(3,2,0,0);const old=serialize();openConsideration('corridor_trial');deserialize(old);t('legacy expanded reload',OX===997&&OY===998&&tileEdits.get((1000-OY)*W+(1000-OX))===KIND_INDEX.w);
let before=JSON.stringify({...serialize(),updatedAt:''});let threw=false;try{deserialize({...old,board:{...old.board,w:999999}})}catch(e){threw=true}t('malformed size preserves',threw&&JSON.stringify({...serialize(),updatedAt:''})===before);
return a;})()`,ctx,{timeout:10000});console.log(JSON.stringify({more}));if(more.some(x=>!x.ok))process.exitCode=1;
const bad=vm.runInContext(`(()=>{openConsideration('corridor_trial');tileEdits.set(0,KIND_INDEX.r);const before=JSON.stringify({...serialize(),updatedAt:''});const cases=[{board:'bad'},{board:{id:'unknown',w:999999,h:9,ox:0,oy:0}},{walk:{}},{barriers:42},{frames:[null]}];return cases.map((v,i)=>{let threw=false;try{deserialize(v)}catch(e){threw=true}return {case:i,ok:threw&&JSON.stringify({...serialize(),updatedAt:''})===before}})})()`,ctx,{timeout:10000});console.log(JSON.stringify({bad}));if(bad.some(x=>!x.ok))process.exitCode=1;
const review=vm.runInContext(`(()=>{const checks=[];const ok=(name,v)=>checks.push({name,ok:!!v});
for(const [field,type] of [['objects','objects'],['markers','markers'],['slopes','slopes']]) {
 openConsideration('corridor_trial');growBoard(1,1,1,1);
 if(field==='objects'){undoStack.push({type,prev:objects.map(x=>({...x}))});objects.push({id:'o',type:'box',x:4301,y:1001,w:1,h:1})}
 if(field==='markers'){undoStack.push({type,prev:markers.map(x=>({...x}))});markers.push({id:'m',x:4301,y:1001,w:1,h:1,label:'x',color:'#eeeeee'})}
 if(field==='slopes'){undoStack.push({type,prev:slopes.map(x=>({...x}))});slopes.push({id:'s',dir:'r',x:4301,y:1001,len:1,width:1})}
 undo();undo();const count=field==='objects'?objects.length:field==='markers'?markers.length:slopes.length;ok(field+' does not revive',count===0&&OX===4300&&W===28);
}
openConsideration('corridor_trial');growBoard(3,2,1,1);document.getElementById('sketchName').value='after';document.getElementById('note').value='later note';player={x:4302.5,y:1003.25};undo();ok('later metadata kept',document.getElementById('sketchName').value==='after'&&document.getElementById('note').value==='later note'&&player.x===4302.5&&player.y===1003.25);
openConsideration('corridor_trial');growBoard(2,2,1,1);player={x:4298.5,y:998.5};undo();ok('outside player clamped with notice',player.x===4300&&player.y===1000&&document.getElementById('saveStatus').textContent.includes('範囲外'));
openConsideration('corridor_trial');growBoard(1,1,0,0);document.getElementById('brush').value='1';beginStroke();tool='walk_no';applyBrush(2,2);endStroke();undo();undo();ok('planning cells do not revive',walkEdits.size===0&&OX===4300);
return checks;})()`,ctx,{timeout:10000});console.log(JSON.stringify({review}));if(review.some(x=>!x.ok))process.exitCode=1;