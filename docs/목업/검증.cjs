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
run('PAY-6', 'PAY6()');
run('PAY-6 전체 펼침', 'RC.P.dep.forEach(d=>RC.op[d.no]=true);PAY6()');
run('PAY-6 임차인 선택', "RC.pre[8]='아마데우스코리아';RC.op[8]=true;PAY6()");
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
/* ⑥ 수납 기록 — 8월 실제 거래내역으로 매칭·배분·미납을 검산한다 → 4.3 · 4.6 */
const W = new Function(stub + bare + '; return {RC,rcRun,rcApprove,dueOf,normName,PAID,BILLS};')();
const P6 = W.RC.P;
const r6 = [];
r6.push(['거래 56 · 입금 14 · 출금 42', P6.rows.length === 56 && P6.dep.length === 14 && P6.wd.length === 42]);
r6.push(['머리말 2행 건너뜀', P6.skip === 2]);
const first = W.rcRun();
const auto = P6.dep.filter(d => first[d.no].st === '자동').length;
r6.push(['첫 달 자동 매칭 0건 — 등록된 입금자명만 자동', auto === 0]);
r6.push(['상호가 같으면 후보', first[9].st === '후보' && first[9].basis === '상호 일치']);
const asg = (no, biz) => { W.RC.dec[no] = { biz }; W.RC.alias[W.normName(P6.dep.find(d => d.no === no).name)] = biz; };
asg(1, '루비뮤직'); asg(2, '케이큐엔터테이먼트'); asg(3, '케이더블유인터내셔널'); asg(5, '아이씨비');
asg(7, '에스씨케이컴퍼니'); asg(8, '아마데우스'); asg(9, '고우컴퍼니'); asg(10, '유니버셜대부');
asg(12, '비씨에이전시'); asg(24, '좋은생각사람들');
W.RC.dec[17] = { ex: true }; W.RC.dec[55] = { ex: true };
const R6 = W.rcRun();
r6.push(['분리 입금 — 13,200,000은 임대료에', R6[7].how === '항목 일치' && R6[7].lines[0].n === '임대료']);
r6.push(['분리 입금 — 나머지는 같은 청구서에', R6[6].st === '자동' && R6[6].how === '청구서 일치' && R6[6].lines.every(l => l.no === '본관1층')]);
r6.push(['별칭 등록 후 같은 이름 입금 자동', R6[4].st === '자동']);
r6.push(['입금 1건 → 계약 2개 (ICB)', new Set(R6[5].lines.map(l => l.no)).size === 2 && R6[5].rest === 0]);
r6.push(['입금 1건 → 계약 2개 (좋은생각사람들)', new Set(R6[24].lines.map(l => l.no)).size === 2 && R6[24].rest === 0]);
r6.push(['임차인 입금 12건 전부 전액 배분', [1,2,3,4,5,6,7,8,9,10,12,24].every(n => R6[n].lines && R6[n].rest === 0 && R6[n].lines.every(l => l.after === '완납'))]);
W.rcApprove();
const all13 = ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','본관1층','본관B2','별관4층','별관3층','별관2층'];
r6.push(['승인 후 미납 0 — 8월 전원 완납', all13.every(n => !W.dueOf('b1' + n))]);
r6.push(['8월 청구 합계 = 임차인 입금 합계', W.BILLS.reduce((a, i) => a + i.amt, 0) === 138919945]);
const bad6 = r6.filter(x => !x[1]);
if (bad6.length) fail = 1;
console.log('⑥ 수납 기록 ' + (bad6.length ? '✗ ' + bad6.map(x => x[0]).join(' / ') : 'OK — ' + r6.length + '개 검산'));
process.exit(fail);
