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
for (const c of ['elec', 'water', 'gas', 'parking'])
  run('PAY-10 ' + c, "pCode='" + c + "';PAY10()");
run('PAY-10 항목 없음', "Object.keys(BILL).forEach(k=>BILL[k].on=false);PAY10()");
run('PAY-10 패널', "DRAWER='additem';dPick=['fund'];drawerHTML()");
run('PRO-1', 'PRO1()');
for (const t of ['요약', '유닛', '자료보관', '관리비 설정'])
  run('PRO-3 ' + t, "tab3='" + t + "';PRO3('b1')");
for (const b of ['b2', 'b3', 'b4', 'b5']) run('PRO-3 ' + b, "tab3='요약';PRO3('" + b + "')");
run('PRO-3 금악빌딩 관리비 설정', "tab3='관리비 설정';PRO3('b4')");
run('PAY-12', 'PAY12()');
run('PAY-1', 'PAY1()');
for (const f of ["f1.b='b2'", "f1.b='b4'", "f1.st='발행 대기'", "f1.st='발행 완료'", "f1.b='b3'"])
  run('PAY-1 필터 ' + f, "f1={b:'b1',st:''};" + f + ';PAY1()');
run('PAY-1 전체 펼침', "f1={b:'b1',st:''};g1All=true;PAY1()");
run('PAY-1 선택 발행', "f1={b:'b1',st:''};sel1['b1101호']=true;PAY1()");
run('미구현 화면', "TODO('pay-2')");
if (!fail) console.log('② 전 화면 렌더                  OK');

/* ③ 계산 검산 — 4.1.2 */
const X = new Function(stub + bare + '; return {selItems,calc,billTotal,BILL,MASTER};')();
for (const it of X.selItems()) {
  const R = X.calc(it);
  const tot = R.rows.reduce((a, r) => a + r.tot, 0);
  /* 참조 항목(전력기금·TV수신료)은 자기 사용량이 없고 참조 대상의 검침값을 쓴다 */
  const own = X.BILL[it.code].use;
  const use = own == null ? R.totUse : own;
  const ratio = R.rows.reduce((a, r) => a + r.ratio, 0);
  const sumOK = Math.abs(tot - use) < 0.01;
  const ratOK = Math.abs(ratio - 1) < 0.0001;
  const amtOK = R.diff === 0;   /* 잔차를 최대 몫 유닛에 더하므로 언제나 0 — 4.1.8 */
  const negOK = R.rows.every(r => r.use >= 0 && r.common >= -0.001 && r.amt >= 0);
  if (!sumOK || !ratOK || !amtOK || !negOK) fail = 1;
  console.log('③ ' + it.name.padEnd(7) +
    ' 총사용량 ' + tot.toFixed(1) + '/' + use + (own == null ? ' 참조' : sumOK ? ' ✓' : ' ✗') +
    '  배분비율 ' + ratio.toFixed(4) + (ratOK ? ' ✓' : ' ✗') +
    '  차액 ' + R.diff + (amtOK ? ' ✓' : ' ✗') +
    '  절사잔차 ' + (R.rem || 0) + '원' + (negOK ? '' : '   ✗ 음수 발생'));
}
/* ④ 조정 배율이 실제로 결과를 바꾸는가 — 변수 가림으로 무력화된 적이 있다 */
const Y = new Function(stub + bare + '; return {calc,ratios,BILL,M,isDirect,METER};')();
const tgt = (Y.METER.elec || [])[0];
if (tgt) {
  const before = Y.calc(Y.M('elec')).rows.find(r => r.no === tgt);
  Y.BILL.elec.adj[tgt] = { mul: 2 };
  const after = Y.calc(Y.M('elec')).rows.find(r => r.no === tgt);
  /* 배율 N이면 그 유닛의 공용 사용량이 정확히 N배여야 한다 — 4.1.2 */
  const exact = Math.abs(after.common - before.common * 2) < 0.05;
  const totalOK = Math.abs(Y.calc(Y.M('elec')).common -
    Y.calc(Y.M('elec'), true).common) < 0.01;
  const ok = after.mul === 2 && exact && totalOK;
  if (!ok) fail = 1;
  console.log('④ 조정 배율 ×2  ' + tgt + '  공용 ' + before.common.toFixed(1) +
    ' → ' + after.common.toFixed(1) + '  (기대 ' + (before.common * 2).toFixed(1) + ')' +
    (ok ? '  ✓ 총량 불변' : '  ✗'));
  delete Y.BILL.elec.adj[tgt];
}
/* ⑤ 검침값·계량기·계기배율의 유닛 번호가 실제 유닛과 맞는가 */
const Z = new Function(stub + bare + '; return {BILL,METER,CTMUL,UNITS_B1,MASTER};')();
const names = new Set(Z.UNITS_B1.map(u => u.no));
let orphan = [];
for (const m of Z.MASTER) {
  const b = Z.BILL[m.code] || {};
  for (const k of Object.keys(b.read || {})) if (!names.has(k)) orphan.push(m.name + '.검침:' + k);
  for (const k of (Z.METER[m.code] || [])) if (!names.has(k)) orphan.push(m.name + '.계량기:' + k);
  for (const k of Object.keys(Z.CTMUL[m.code] || {})) if (!names.has(k)) orphan.push(m.name + '.배율:' + k);
  for (const k of Object.keys(b.direct || {})) if (!names.has(k)) orphan.push(m.name + '.직접입력:' + k);
}
if (orphan.length) fail = 1;
console.log('⑤ 유닛 번호 정합성 ' + (orphan.length ? '✗ ' + orphan.join(', ') : 'OK'));
process.exit(fail);
