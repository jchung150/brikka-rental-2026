/* 목업 수정 후 반드시 실행한다.  node 검증.js
   문법 검사만으로는 함수 유실을 잡지 못한다. 호출부만 남아도 문법은 정상이다. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, 'brikka-mockup.html');
const html = fs.readFileSync(file, 'utf8');

const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.log('✗ script 블록을 찾지 못했다'); process.exit(1); }
const src = m[1];
const bare = src.replace(/paintOp\(\);paintFold\(\);render\(\);/, '');

const stub = `
const document={querySelector:()=>({innerHTML:'',style:{},classList:{toggle(){}},textContent:''}),
  querySelectorAll:()=>[],addEventListener(){}};
const window={scrollTo(){},addEventListener(){}};
const location={hash:''};
const addEventListener=()=>{};
const localStorage={getItem:()=>null,setItem(){}};
`;

let fail = 0;

/* ① 전체 실행 — 미정의 함수를 잡는다 */
try { new Function(stub + src)(); console.log('① 전체 실행 (미정의 함수 탐지)   OK'); }
catch (e) { console.log('① ✗ ' + e.message); process.exit(1); }

/* ② 화면·탭·패널 렌더 */
const run = (label, code) => {
  try { new Function(stub + bare + ';' + code)(); }
  catch (e) { console.log('② ' + label + ' ✗ ' + e.message); fail = 1; }
};
for (let s = 0; s < 4; s++) run('PAY-10 ' + (s + 1) + '단계', 'pStep=' + s + ';PAY10()');
run('PAY-10 패널', "DRAWER='additem';dPick=['fund'];drawerHTML()");
run('PRO-1', 'PRO1()');
for (const t of ['요약', '유닛', '자료보관', '청구설정'])
  run('PRO-3 ' + t, "tab3='" + t + "';PRO3('b1')");
for (const b of ['b2', 'b3', 'b4', 'b5']) run('PRO-3 ' + b, "tab3='요약';PRO3('" + b + "')");
run('미구현 화면', "TODO('pay-2')");
if (!fail) console.log('② 전 화면 렌더                  OK');

/* ③ 계산 검산 — 4.1.2 */
const X = new Function(stub + bare + '; return {selItems,calc,billTotal,BILL,MASTER};')();
for (const it of X.selItems()) {
  const R = X.calc(it);
  const tot = R.rows.reduce((a, r) => a + r.tot, 0);
  const use = X.BILL[it.code].use || 0;
  const ratio = R.rows.reduce((a, r) => a + r.ratio, 0);
  const sumOK = Math.abs(tot - use) < 0.01;
  const ratOK = Math.abs(ratio - 1) < 0.0001;
  const amtOK = R.diff >= 0 && R.diff <= R.rows.length;   /* 절사 차액은 유닛 수 이내 */
  if (!sumOK || !ratOK || !amtOK) fail = 1;
  console.log('③ ' + it.name.padEnd(7) +
    ' 총사용량 ' + tot.toFixed(1) + '/' + use + (sumOK ? ' ✓' : ' ✗') +
    '  배분비율 ' + ratio.toFixed(4) + (ratOK ? ' ✓' : ' ✗') +
    '  절사차액 ' + R.diff + (amtOK ? ' ✓' : ' ✗'));
}
process.exit(fail);
