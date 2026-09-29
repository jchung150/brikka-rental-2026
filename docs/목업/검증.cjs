/* 목업 수정 후 반드시 실행한다.  node 검증.js
   문법 검사만으로는 함수 유실을 잡지 못한다. 호출부만 남아도 문법은 정상이다. */
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, 'brikka-mockup.html');
const html = fs.readFileSync(file, 'utf8');

const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.log('✗ script 블록을 찾지 못했다'); process.exit(1); }
const src = m[1];
const bare = src.replace(/seedJuly\(\);paintOp\(\);paintFold\(\);render\(\);/, '');

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
run('PRO-3 합정동 무악빌딩 관리비 설정', "tab3='관리비 설정';PRO3('b4')");
run('PAY-12', 'PAY12()');
run('PAY-1', 'PAY1()');
for (const f of ["f1.b='b2'", "f1.b='b4'", "f1.st='발행 대기'", "f1.st='발행 완료'", "f1.b='b3'"])
  run('PAY-1 필터 ' + f, "f1={b:'b1',st:''};" + f + ';PAY1()');
run('PAY-1 전체 펼침', "f1={b:'b1',st:''};g1All=true;PAY1()");
run('PAY-1 선택 발행', "f1={b:'b1',st:''};sel1['b1101호']=true;PAY1()");
run('미구현 화면', "TODO('pay-2')");
run('PAY-6', 'PAY6()');
run('PAY-6 전체 펼침', 'g6All=true;PAY6()');
run('PAY-13', 'PAY13()');
run('PAY-12 7월', "f12='2026-07';PAY12()");
run('PAY-2 펼침', "seedJuly();g2All=true;PAY2()");
run('PAY-11 테온하우스 (7월 마감 대기)', "seedJuly();mcBld('b2');PAY11()");
run('수납 처리 패널 연체료 50% 감면', "seedJuly();openPay('b1별관3층');setPm('feeMode','half');payHTML()");
run('PAY-11', "seedJuly();PAY11()");
for (const [b, ym] of [['b2','2026-07'],['b1','2026-08'],['b4','2026-05'],['b3','2026-08']])
  run('PAY-11 ' + b + ' ' + ym, "seedJuly();s11={b:'" + b + "',ym:'" + ym + "'};PAY11()");
run('PAY-11 보고서 3개월 선택', "seedJuly();['2026-05','2026-06','2026-07'].forEach(v=>sel11[v]=true);PAY11()");
run('PAY-11 테온하우스 7월 마감 → 목록', "seedJuly();mcBld('b2');mcDo('2026-07','close');mcApply();PAY11()");
run('PAY-11 마감 패널', "s11={b:'b2',ym:'2026-07'};mcOpen('close');mcHTML()");
run('PAY-11 마감 취소 패널', "mcOpen('undo');mcHTML()");
run('PAY-6 8월 (발행 전)', "RC.f.ym='2026-08';PAY6()");
run('PAY-13 7월 처리 완료', "seedJuly();PAY13()");
run('수납 처리 패널', "openPay('b1별관3층');payHTML()");
run('수납 처리 패널 보증금상계', "openPay('b1별관3층');setPm('how','보증금상계');payHTML()");
run('수납 처리 패널 초과', "openPay('b1별관3층');setPm('amt','99999999');payHTML()");
run('수납 처리 패널 미납 없음', "openPay('b1본관8층');payHTML()");
run('수납 처리 패널 연체료 낮춰 받기', "openPay('b1별관3층');setPm('feeOn','1');setPm('fee','50000');payHTML()");
run('수납 처리 패널 연체료만', "openPay('b1본관B2');setPm('feeOn','1');payHTML()");
run('PAY-2', 'PAY2()');
run('CTR-1', 'CTR1()');
for (const f of ["f1c.st=''", "f1c.b='b2'", "f1c.dd='90'", "f1c.dd='0'"]) run('CTR-1 필터 ' + f, "f1c={b:'',st:'진행중',dd:''};" + f + ';CTR1()');
run('CTR-3 요약', "tab3c='요약';CTR3('b1별관3층')");
run('CTR-3 빈 탭', "tab3c='자료보관';CTR3('b1별관3층')");
run('CTR-3 원장 비씨에이전시', "tab3c='원장정보';CTR3('b1별관3층')");
run('CTR-3 원장 전체 펼침', "tab3c='원장정보';g3All=true;CTR3('b1본관1층')");
run('CTR-3 원장 필터', "tab3c='원장정보';f3={per:'3',acc:'매출채권'};CTR3('b1본관302호')");
run('CTR-3 없는 계약', "CTR3('b9없음')");
run('PAY-2 전체 펼침 · 전체 계약', "g2All=true;f2.view='all';PAY2()");
run('PAY-2 종료 계약', "f2.cs='종료';PAY2()");
run('PAY-2 다른 건물', "f2.b='b2';PAY2()");
run('PAY-6 7월', "RC.f.ym='2026-07';g6All=true;PAY6()");
run('PAY-13 임차인 선택', "RC.pre[8]='아마데우스';RC.cur=8;PAY13()");
run('PAY-13 미매칭', "RC.cur=5;PAY13()");
run('PAY-13 무시', "RC.dec[17]={ex:true};RC.cur=17;PAY13()");
run('PAY-13 전체 처리', "Object.assign(RC.alias,{'루비뮤직':'루비뮤직'});RC.cur=1;rcConfirm(1);RC.cur=1;PAY13();g6All=true;PAY6()");
run('PAY-13 다른 건물', "RC.f.b='b2';PAY13()");
for (const f of ["RC.f.st='완납'", "RC.f.st='부분납'", "RC.f.st='납부전'", "RC.f.b='b2'", "RC.f.ym='2026-07'"])
  run('PAY-6 필터 ' + f, "RC.f={b:'b1',ym:'2026-08',st:''};" + f + ';PAY6()');
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
  const nNeg = R.rows.filter(r => r.neg).length;
  const negOK = nNeg ? true : R.rows.every(r => r.use >= 0 && r.common >= -0.001 && r.amt >= 0);
  if (!sumOK || !ratOK || !amtOK || !negOK) fail = 1;
  console.log('③ ' + it.name.padEnd(7) +
    ' 총사용량 ' + tot.toFixed(1) + '/' + use + (own == null ? ' 참조' : sumOK ? ' ✓' : ' ✗') +
    '  배분비율 ' + ratio.toFixed(4) + (ratOK ? ' ✓' : ' ✗') +
    '  차액 ' + R.diff + (amtOK ? ' ✓' : ' ✗') +
    '  절사잔차 ' + (R.rem || 0) + '원' + (negOK ? '' : '   ✗ 음수 발생') +
    (nNeg ? '   ⚠ 검침 역전 ' + nNeg + '곳 — 확정 불가(경고 정상)' : ''));
}
/* ④ 조정 배율이 실제로 결과를 바꾸는가 — 변수 가림으로 무력화된 적이 있다 */
const Y = new Function(stub + bare + '; return {calc,ratios,BILL,M,isDirect,METER};')();
/* 검침 역전 유닛은 미입력으로 돌려 깨끗한 상태에서 본다 */
for (const [no, v] of Object.entries(Y.BILL.elec.read || {})) if (v[1] != null && v[1] < v[0]) v[1] = null;
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
/* ⑥ 수납 기록 — 7월 거래내역(8월 실제 거래내역을 옮긴 예시)으로 매칭·배분·미납을 검산한다 → 4.3 · 4.6 */
const W = new Function(stub + bare + '; return {RC,ledgerOf,lateCalc,rcPreview,ctrPay,ctrDeps,rcRun,rcQueue,rcGuess,rcBiz,rcConfirm,rcIgnore,rcNext,rcOpenN,dueOf,normName,PAID,BILLS,openPay,setPm,payPlan,payConfirm,feeUntil,FEE_CUT,get pm(){return pm;}};')();
const P6 = W.RC.P;
const r6 = [];
r6.push(['거래 56 · 입금 14 · 출금 42', P6.rows.length === 56 && P6.dep.length === 14 && P6.wd.length === 42]);
r6.push(['머리말 2행 건너뜀', P6.skip === 2]);
const first = W.rcRun();
const auto = P6.dep.filter(d => first[d.no].st === '자동').length;
r6.push(['첫 달 자동 매칭 0건 — 등록된 입금자명만 자동', auto === 0]);
r6.push(['상호가 같으면 미매칭이되 임차인을 미리 채움', first[9].st === '후보' && first[9].cand === '고우컴퍼니']);
/* 배분 미리보기는 채우지 못하는 청구까지 보여야 한다 */
const pvB = W.rcPreview(P6.dep.find(d => d.no === 12), '비씨에이전시', W.rcBiz());
r6.push(['미리보기 — 비씨에이전시 5·6·7월 18개 항목, 5월분부터 채우고 배분 후 미납 10,292,820',
  pvB.all.length === 18 && pvB.lines[0].ym === '2026-05' && pvB.all.reduce((a, l) => a + l.due - l.pay, 0) === 10292820]);
/* 입금 매칭 — 대기열 순서(입금일시 오름차순)대로 한 건씩 임차인을 고르고 확정한다 */
const PICK = {1:'루비뮤직', 2:'케이큐엔터테이먼트', 3:'케이더블유인터내셔널', 5:'아이씨비', 7:'에스씨케이컴퍼니',
  8:'아마데우스', 9:'고우컴퍼니', 10:'유니버셜대부', 12:'비씨에이전시', 24:'좋은생각사람들'};
const got = {};
for (const d of W.rcQueue()) {
  if ([17, 55].includes(d.no)) { W.rcIgnore(d.no); continue; }
  const g = W.rcGuess(d, W.rcBiz());
  if (g.st !== '자동') W.RC.pre[d.no] = PICK[d.no];
  W.rcConfirm(d.no);
  got[d.no] = W.RC.dec[d.no].done;
}
r6.push(['분리 입금 — 13,200,000은 임대료에', got[7].lines.length === 1 && got[7].lines[0].n === '임대료']);
r6.push(['분리 입금 — 나머지는 같은 계약에', got[6].was === '자동' && got[6].rest === 0 && got[6].lines.every(l => l.no === '본관1층')]);
r6.push(['입금자명 등록 후 같은 이름 입금 자동', got[4].was === '자동' || got[3].was === '자동']);
r6.push(['입금 1건 → 계약 2개 (ICB)', new Set(got[5].lines.map(l => l.no)).size === 2 && got[5].rest === 0]);
r6.push(['입금 1건 → 계약 2개 (좋은생각사람들)', new Set(got[24].lines.map(l => l.no)).size === 2 && got[24].rest === 0]);
r6.push(['임차인 입금 12건 전부 전액 배분', [1,2,3,4,5,6,7,8,9,10,12,24].every(n => got[n] && got[n].rest === 0)]);
r6.push(['대기 0건 — 모두 처리', W.rcNext() === null && W.rcOpenN() === 0]);
/* 계약별 납부상태 — 비씨에이전시 5월 부분납 · 6·7월 미납(마감 경과, 수납 0), 루비뮤직 6월 미납분 해소 → PAY-6 · 3.2 */
const st6 = (n, ym) => W.ctrPay('b1' + n, ym || '2026-07').st;
r6.push(['수납 내역 — 비씨에이전시 5월 부분납 · 6월 미납 · 7월 미납',
  st6('별관3층', '2026-05') === '부분납' && st6('별관3층', '2026-06') === '미납' && st6('별관3층') === '미납']);
r6.push(['수납 내역 — 나머지 12계약 7월 완납, 루비뮤직 6월도 완납',
  ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','본관1층','본관B2','별관4층','별관2층'].every(n => st6(n) === '완납')
  && st6('본관B2', '2026-06') === '완납']);
r6.push(['케이더블유인터 두 입금이 각 계약에 자기 몫만', W.ctrDeps('b1본관5층').length >= 1 && W.ctrDeps('b1별관2층').length >= 1]);
/* 연체료 구간 계산 — 비씨에이전시(연 12%) 5월분: 5/31~7/31 5,086,514원 → 7/31 입금 후 86,514원, 오늘 8/10까지 → 4.4 */
const L5 = W.lateCalc('b1별관3층', '2026-05'), LR = W.lateCalc('b1본관B2', '2026-06');
r6.push(['연체료 구간 — 비씨에이전시 5월분 102,008 + 284 = 102,292',
  L5.periods.length === 2 && L5.periods[0].fee === 102008 && L5.periods[1].fee === 284 && L5.fee === 102292]);
r6.push(['연체료 합계 — 비씨에이전시 5월 102,292 + 6월 69,007 + 7월 16,723 = 188,022',
  W.lateCalc('b1별관3층', '2026-06').fee === 69007 && W.lateCalc('b1별관3층', '2026-07').fee === 16723 && W.feeUntil('b1별관3층', '2026-08-10') === 188022]);
r6.push(['늦게 다 낸 달에도 연체료 — 루비뮤직 6월분 385,000 × 8% × 31일 = 2,615', LR.fee === 2615 && LR.periods[0].days === 31]);
/* 계약 원장 — 비씨에이전시: 매출채권 잔액 = 미납 10,292,820, 수납 줄은 7/31 입금에서 */
const LB = W.ledgerOf('b1별관3층');
r6.push(['원장 — 비씨에이전시 매출채권 잔액 10,292,820 · 청구 18줄 · 수납은 7/31 입금',
  LB.bal.매출채권 === 10292820 && LB.rows.filter(r => r.type === '청구').length === 18 &&
  LB.rows.filter(r => r.type === '수납').every(r => r.date === '2026-07-31')]);
/* 원장 잔액 — 청구 전부 − 수납 전부 */
const left = k => W.BILLS.filter(i => i.k === k).reduce((a, i) => a + i.amt - (W.PAID[i.id] || 0), 0);
const all12 = ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','본관1층','본관B2','별관4층','별관2층'];
r6.push(['미납 기록 — 비씨에이전시 10,292,820원만 남음 (루비뮤직 6월분 해소)', all12.every(n => left('b1' + n) === 0) && left('b1별관3층') === 10292820]);
r6.push(['PAY-1 8월 발행 화면의 미납 잔액 — 7월까지의 미납', W.dueOf('b1별관3층').amt === 10292820 && W.dueOf('b1별관3층').from === '2026-05']);
/* 현장 수납 — 입금 매칭을 다 끝낸 뒤 비씨에이전시가 현금 600만 원을 들고 왔다 → PAY-2 수납 처리 */
W.openPay('b1별관3층'); W.setPm('amt', 6000000);
const pc = W.payPlan();
W.payConfirm();
const LC = W.ledgerOf('b1별관3층');
r6.push(['현장 수납 현금 600만 — 오래된 달부터 · 미납 4,292,820 · 원장 매출채권 잔액 일치 · 「현금 수납」 기록',
  pc.lines[0].ym <= pc.lines[pc.lines.length - 1].ym && pc.rest === 0 && left('b1별관3층') === 4292820
  && LC.bal.매출채권 === 4292820 && LC.rows.some(r => r.type === '수납' && r.hand && / 현금$/.test(r.src))]);
const dep0 = LC.bal.임대보증금;
W.openPay('b1별관3층'); W.setPm('how', '보증금상계'); W.setPm('amt', 1000000); W.payConfirm();
const LD = W.ledgerOf('b1별관3층');
r6.push(['보증금상계 100만 — 미납 3,292,820 · 보증금 잔액 100만 감소 · 보증금 차감 행',
  left('b1별관3층') === 3292820 && LD.bal.매출채권 === 3292820 && LD.bal.임대보증금 === dep0 - 1000000
  && LD.rows.some(r => r.type === '보증금 차감' && r.dec === 1000000)]);
W.openPay('b1별관3층'); W.setPm('amt', 99999999); W.payConfirm();
r6.push(['미납보다 많이 받으면 확정되지 않음', left('b1별관3층') === 3292820]);
/* 연체료 — 받지 않으면 계속 쌓이고, 받으면 낮춘 금액만 청구·수납되고 그날까지는 다시 세지 않는다 → 4.4.3 */
const fee0 = W.feeUntil('b1별관3층', '2026-08-10');
W.openPay('b1별관3층'); W.setPm('feeMode', 'custom'); W.setPm('fee', '100000');
const amtF = W.pm.amt;
W.payConfirm();
const LF = W.ledgerOf('b1별관3층');
const feeRow = LF.rows.find(r => r.type === '청구' && /^연체료/.test(r.item));
r6.push(['연체료 낮춰 받기 — 받을 금액 = 미납 + 10만 · 연체료 청구 10만(감면 표기) · 완납 · 남은 연체료 0',
  fee0 > 100000 && amtF === 3292820 + 100000 && left('b1별관3층') === 0 && LF.bal.매출채권 === 0
  && feeRow && feeRow.inc === 100000 && /감면/.test(feeRow.item) && W.feeUntil('b1별관3층', '2026-08-10') === 0]);
const ruby0 = W.feeUntil('b1본관B2', '2026-08-10');
W.openPay('b1본관B2'); W.setPm('feeMode', 'waive'); W.payConfirm();
r6.push(['연체료 전액 감면 — 루비뮤직 2,615 → 0 · 청구 없음',
  ruby0 === 2615 && W.feeUntil('b1본관B2', '2026-08-10') === 0 && !W.BILLS.some(i => i.k === 'b1본관B2' && i.fee)]);
/* 미납액 먼저 — 6월 미납이 있으면 7월 청구서와 같은 금액이 와도 6월부터 채운다 → 4.3.3 */
const V = new Function(stub + bare + '; return {rcPlan,BILLS};')();
{ const keep = V.BILLS.filter(i => !(i.k === 'b1본관302호' && i.ym !== '2026-07')); V.BILLS.length = 0; V.BILLS.push(...keep); }
V.BILLS.push({id:'2026-06|본관302호|고정관리비',ym:'2026-06',k:'b1본관302호',no:'본관302호',n:'고정관리비',pr:2,amt:1815000});
V.BILLS.push({id:'2026-06|본관302호|전기요금',ym:'2026-06',k:'b1본관302호',no:'본관302호',n:'전기요금',pr:4,amt:1865000});
const pv = V.rcPlan(13619678, ['b1본관302호'], {});
const jun = pv.lines.filter(l => l.ym === '2026-06').reduce((a, l) => a + l.pay, 0);
const jl = pv.lines.filter(l => l.ym === '2026-07');
r6.push(['미납액 먼저 — 6월 3,680,000 완납 · 7월 임대료 9,939,678 부분납',
  jun === 3680000 && jl.length === 1 && jl[0].n === '임대료' && jl[0].pay === 9939678 && jl[0].after === '부분납']);
/* 나눠 보낸 입금 — 백만 원 적게 보낸 뒤 나머지를 다음 날 같은 이름으로 보낸 경우 */
const S = new Function(stub + bare + '; return {RC,rcGuess,rcBiz,rcConfirm,ctrPay};')();
const s1 = {no:901,dt:'2026-07-31 12:34:01',kind:'PC뱅킹',name:'AMADEUS KO',amt:12659175,out:0};
const s2 = {no:902,dt:'2026-08-01 10:02:44',kind:'PC뱅킹',name:'AMADEUS KO',amt:1000000,out:0};
S.RC.P.dep = [s1, s2]; S.RC.pre[901] = '아마데우스'; S.rcConfirm(901);
const mid = S.ctrPay('b1본관6층', '2026-07');
const auto2 = S.rcGuess(s2, S.rcBiz()).st === '자동';
S.rcConfirm(902);
const end = S.ctrPay('b1본관6층', '2026-07');
r6.push(['나눠 보낸 입금 — 1차 부분납 100만 미납 → 2차 자동 매칭 → 완납',
  mid.st === '부분납' && mid.due === 1000000 && auto2 && end.st === '완납' && end.due === 0]);
/* 화면을 열 때의 상태 — 7월 입금은 월 마감(8/5) 전에 모두 처리됐다 */
const O = new Function(stub + bare + '; seedJuly(); return {rcOpenN,dueOf,ctrPay,BILLS};')();
r6.push(['첫 화면 — 7월 입금 대기 0건 · 비씨에이전시 미납 10,292,820 · 8월 청구 없음',
  O.rcOpenN() === 0 && O.dueOf('b1별관3층').amt === 10292820 && !O.BILLS.some(i => i.ym === '2026-08')]);
/* 월 마감 — 7월 이준빌딩: 확인 항목 모두 통과 · 취소는 사유가 있어야 · 다시 마감 */
const M = new Function(stub + bare + '; seedJuly(); return {MC,MC_LOG,mcChecks,mcOpen,mcApply,get mcx(){return mcx;},s11};')();
const okAll = M.mcChecks('b1', '2026-07').every(x => x.ok);
M.mcOpen('undo'); M.mcApply(); const kept = !!M.MC.b1['2026-07'];
M.mcx.why = '수납 배분 재조정'; M.mcApply(); const undone = !M.MC.b1['2026-07'];
M.mcOpen('close'); M.mcApply();
r6.push(['월 마감 — 이준빌딩 7월 확인 6항목 통과 · 사유 없으면 취소 안 됨 · 취소 후 다시 마감 · 이력 2줄',
  okAll && kept && undone && !!M.MC.b1['2026-07'] && M.MC_LOG['b1|2026-07'].length === 2]);
/* 연체료 50% 감면 · 연체료만 남은 계약도 미납 관리에 — 화면을 연 상태(7월 처리 완료)에서 */
const H = new Function(stub + bare + '; seedJuly(); return {openPay,setPm,payConfirm,ledgerOf,arrears,CTRS,get pm(){return pm;},f2,PAY2};')();
H.openPay('b1본관B2'); const rubyMode = H.pm.feeMode === 'full' && H.pm.amt === 2615;
H.openPay('b1별관3층'); H.setPm('feeMode', 'half');
const half = H.pm.fee === 94011 && H.pm.amt === 10292820 + 94011;
H.payConfirm();
const LH = H.ledgerOf('b1별관3층'), hRow = LH.rows.find(r => r.type === '청구' && /^연체료/.test(r.item));
r6.push(['연체료 50% 감면 — 188,022 → 94,011 받음 · 94,011 감면 표기 · 미납 0 · 루비뮤직은 연체료 전액이 기본',
  rubyMode && half && LH.bal.매출채권 === 0 && hRow && hRow.inc === 94011 && /94,011원 감면/.test(hRow.item)]);
r6.push(['연체료만 남은 루비뮤직도 미납 관리 기본 보기에', /본관B2/.test(H.PAY2())]);
const bad6 = r6.filter(x => !x[1]);
if (bad6.length) fail = 1;
console.log('⑥ 수납 기록 ' + (bad6.length ? '✗ ' + bad6.map(x => x[0]).join(' / ') : 'OK — ' + r6.length + '개 검산'));
process.exit(fail);
