#!/bin/sh
# 목업 수정 후 반드시 실행한다. 함수 유실·렌더 오류·계산 오차를 잡는다.
cd "$(dirname "$0")"
node -e '
const h=require("fs").readFileSync("brikka-mockup.html","utf8");
const m=h.match(/<script>([\s\S]*)<\/script>/); if(!m){console.log("✗ script 블록 없음");process.exit(1)}
const src=m[1];
const stub=`const document={querySelector:()=>({innerHTML:"",style:{},classList:{toggle(){}},textContent:""}),querySelectorAll:()=>[],addEventListener(){}};const window={scrollTo(){},addEventListener(){}};const location={hash:""};const addEventListener=()=>{};const localStorage={getItem:()=>null,setItem(){}};`;
const bare=src.replace(/paintOp\(\);paintFold\(\);render\(\);/,"");
let fail=0;
try{ new Function(stub+src)(); console.log("① 전체 실행 (미정의 함수 탐지)  OK"); }
catch(e){ console.log("① ✗",e.message); process.exit(1); }
const run=(label,code)=>{ try{ new Function(stub+bare+";"+code)(); }catch(e){ console.log("② "+label+" ✗ "+e.message); fail=1; } };
for(let s=0;s<4;s++) run("PAY-10 "+(s+1)+"단계","pStep="+s+";PAY10()");
run("PAY-10 드로어","DRAWER='additem';drawerHTML()");
run("PRO-1","PRO1()"); run("PRO-3 요약","tab3='요약';PRO3('b1')");
run("PRO-3 유닛","tab3='유닛';PRO3('b1')");
run("PRO-3 자료","tab3='자료보관';PRO3('b1')");
run("PRO-3 청구설정","tab3='청구설정';PRO3('b1')");
if(!fail) console.log("② 전 화면 렌더            OK");
const X=new Function(stub+bare+"; return {selItems,calc,billTotal,BILL};")();
for(const it of X.selItems()){
  const R=X.calc(it), tot=R.rows.reduce((a,r)=>a+r.tot,0), use=X.BILL[it.code].use||0;
  const sumOK=Math.abs(tot-use)<0.01, amtOK=Math.abs(R.diff)<=R.rows.length;
  if(!sumOK||!amtOK) fail=1;
  console.log("③ "+it.name.padEnd(7)+" 총사용량 "+tot.toFixed(1)+"/"+use+(sumOK?" ✓":" ✗")+
    "  금액차 "+R.diff+(amtOK?" ✓":" ✗"));
}
process.exit(fail);
'
