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
run('PAY-10 일회성 청구', "dPick=['once'];dApply();onceSet(0,'k','b1본관B2');onceSet(0,'amt','110000');onceAdd();PAY10()+drawerHTML()");
run('PAY-10 안분 제외 표시', "ciToggle('b1본관2층','전기요금');pCode='elec';PAY10()");
run('PAY-1 금액 0원 표시', "ciToggle('b1본관301호','고정관리비');PAY1()");
run('PAY-10 7월 마감 회차', "f10ym='2026-07';PAY10()");
for (const c of ['elec','water','fund','tv','parking']) run('PAY-10 6월 ' + c, "f10ym='2026-06';pCode='" + c + "';PAY10()");
run('PAY-13 6월', "RC.f.ym='2026-06';PAY13()");
run('PAY-6 6월', "RC.f.ym='2026-06';g6All=true;PAY6()");
run('PAY-10 6월 · 마감 취소 후', "delete MC.b1['2026-06'];f10ym='2026-06';PAY10()");
run('PAY-1 7월 마감 회차', "f1.ym='2026-07';PAY1()");
run('PAY-1 6월 마감 취소 후 · 다른 건물', "delete MC.b1['2026-06'];f1.ym='2026-06';PAY1();f1.b='b2';PAY1()");
run('PAY-13 7월 잠금', "seedJuly();RC.f.ym='2026-07';PAY13()");
run('CTR-2 자료', "nc=null;CTR2();ncFile();ncFile();ncRow('files',0,'c','기타');CTR2()");
run('PAY-10 일회성 청구만', "Object.keys(BILL).forEach(k=>BILL[k].on=false);ONCE.on=true;pCode='once';PAY10()");
run('CTR-2 변경 일정', "nc=null;CTR2();nc.adj.push({d:'2028-11-01',rent:'3465000',mgmt:''});CTR2()");
run('PRO-1', 'PRO1()');
run('CTR-2 빈 화면', "nc=null;CTR2()");
run('CTR-2 입력 · 조회 · 토글', "nc=null;CTR2();ncSet('no','본관302호');ncSet('start','2026-09-01');nc.biz='211-86-40519';ncLookup();ncSet('diff',true);ncSet('proxy',true);ncSet('agent',true);ncSet('late',true);nc.adj.push({d:'',t:'임대료',amt:''});CTR2()");
run('CTR-2 렌트프리', "nc=null;CTR2();ncSet('start','2026-11-01');ncSet('rf','있음');CTR2();ncSet('rfM','2');CTR2();ncSet('rfEnd','2026-10-01');ncSet('rfMgmt',true);CTR2();ncSet('rf','없음');ncSet('late',true);ncSet('lateD','2026-10-01');CTR2()");
run('CTR-2 다른 건물', "nc=null;CTR2();ncSet('b','b2');CTR2()");
run('PRO-1 필터', "f1p={q:'',kind:'오피스빌딩',vac:'0'};PRO1()");
for (const t of ['요약', '유닛', '자료보관', '관리비'])
  run('PRO-3 ' + t, "tab3='" + t + "';PRO3('b1')");
run('PRO-3 유닛 · 다음 계약', "CTRS.push({b:'b1',no:'본관302호',key:'b1본관302호@2026-11-01',ten:'(주)새임차',st:'준비중',base:'2026-11-01',it:[['임대료',3000000]]});tab3='유닛';PRO3('b1')");
{ const U = new Function(stub + bare + '; return BUILDINGS[0].units;')();
  const fl = n => (U.find(u => u.no === n) || {}).fl;
  if (!(U.length === 14 && fl('본관B1') === -1 && fl('본관B2') === -2 && fl('본관301호') === 3 && fl('별관4층') === 4)) { console.log('② 유닛 층 계산 ✗'); fail = 1; } }
for (const b of ['b2', 'b4']) run('PRO-3 ' + b, "tab3='요약';PRO3('" + b + "')");
run('PRO-3 카즈하타워 관리비', "tab3='관리비';PRO3('b4')");
run('PAY-12', 'PAY12()');
run('PAY-1', 'PAY1()');
for (const f of ["f1.b='b2'", "f1.b='b4'", "f1.st='발행 대기'", "f1.st='발행 완료'"])
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
for (const [b, ym] of [['b2','2026-07'],['b1','2026-08'],['b4','2026-06'],['b4','2026-08']])
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
run('CTR-3 청구항목', "tab3c='청구항목';CTR3('b1별관3층')");
run('CTR-3 계약 전환 메뉴', "CSW=true;tab3c='원장';CTR3('b1별관3층')");
run('CTR-3 청구항목 패널', "ciOpen('b1별관3층','edit','전기요금');ciHTML();ciOpen('b1별관3층','edit','임대료');ciSet('fix',true);ciHTML();ciOpen('b1별관3층','edit','전기요금');ciHTML();ciOpen('b1별관3층','adj');ciHTML();ciOpen('b1별관3층','payto');ciHTML()");
run('CTR-3 원장 비씨에이전시', "tab3c='원장';CTR3('b1별관3층')");
run('CTR-3 원장 전체 펼침', "tab3c='원장';g3All=true;CTR3('b1본관1층')");
run('CTR-3 원장 필터', "tab3c='원장';f3={per:'3',acc:'매출채권'};CTR3('b1본관302호')");
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
/* ⑥ 수납 기록 — 6월 처리 후 7월 거래내역(8월 실제 거래내역을 옮긴 예시)으로 매칭·배분·미납을 검산한다 → 4.3 · 4.6 */
const W = new Function(stub + bare + '; return {RC,ledgerOf,lateCalc,rcPreview,ctrPay,ctrDeps,rcRun,rcQueue,rcGuess,rcBiz,rcConfirm,rcIgnore,rcNext,rcOpenN,dueOf,normName,PAID,BILLS,openPay,setPm,payPlan,payConfirm,feeUntil,FEE_CUT,get pm(){return pm;}};')();
const P6 = W.RC.P;
const r6 = [];
r6.push(['거래 56 · 입금 14 · 출금 42', P6.rows.length === 56 && P6.dep.length === 14 && P6.wd.length === 42]);
r6.push(['머리말 2행 건너뜀', P6.skip === 2]);
const first = W.rcRun();
const auto = P6.dep.filter(d => first[d.no].st === '자동').length;
r6.push(['6월에 등록한 입금자명으로 7월 입금 10건 자동 매칭 · 입금자명이 바뀐 아마데우스는 미매칭', auto === 10 && first[8].st === '미매칭']);
r6.push(['처음 입금한 이름이 상호와 같으면 미매칭이되 임차인을 미리 채움', first[12].st === '후보' && first[12].cand === '비씨에이전시']);
/* 배분 미리보기는 채우지 못하는 청구까지 보여야 한다 */
const pvB = W.rcPreview(P6.dep.find(d => d.no === 12), '비씨에이전시', W.rcBiz());
r6.push(['미리보기 — 비씨에이전시 6·7월 12개 항목, 6월분부터 채우고 배분 후 미납 5,146,472',
  pvB.all.length === 12 && pvB.lines[0].ym === '2026-06' && pvB.all.reduce((a, l) => a + l.due - l.pay, 0) === 5146472]);
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
/* 계약별 납부상태 — 비씨에이전시 6월 부분납 · 7월 미납(마감 경과, 수납 0), 루비뮤직 6월 미납분 해소 → PAY-6 · 3.2 */
const st6 = (n, ym) => W.ctrPay('b1' + n, ym || '2026-07').st;
r6.push(['수납 내역 — 비씨에이전시 6월 부분납 · 7월 미납',
  st6('별관3층', '2026-06') === '부분납' && st6('별관3층') === '미납']);
r6.push(['수납 내역 — 나머지 12계약 7월 완납, 루비뮤직 6월도 완납',
  ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','본관1층','본관B2','별관4층','별관2층'].every(n => st6(n) === '완납')
  && st6('본관B2', '2026-06') === '완납']);
r6.push(['케이더블유인터 두 입금이 각 계약에 자기 몫만', W.ctrDeps('b1본관5층').length >= 1 && W.ctrDeps('b1별관2층').length >= 1]);
/* 연체료 구간 계산 — 비씨에이전시(연 12%) 6월분: 6/30~7/31 5,054,474원 → 7/31 입금 후 54,474원, 오늘 8/10까지 → 4.4 */
const L6 = W.lateCalc('b1별관3층', '2026-06'), LR = W.lateCalc('b1본관B2', '2026-06');
r6.push(['연체료 구간 — 비씨에이전시 6월분 51,514 + 179 = 51,693',
  L6.periods.length === 2 && L6.periods[0].fee === 51514 && L6.periods[1].fee === 179 && L6.fee === 51693]);
r6.push(['연체료 합계 — 비씨에이전시 6월 51,693 + 7월 16,740 = 68,433',
  W.lateCalc('b1별관3층', '2026-07').fee === 16740 && W.feeUntil('b1별관3층', '2026-08-10') === 68433]);
r6.push(['늦게 다 낸 달에도 연체료 — 루비뮤직 6월분 385,000 × 8% × 31일 = 2,615', LR.fee === 2615 && LR.periods[0].days === 31]);
/* 계약 원장 — 비씨에이전시: 매출채권 잔액 = 미납 5,146,472, 수납 줄은 7/31 입금에서 */
const LB = W.ledgerOf('b1별관3층');
r6.push(['원장 — 비씨에이전시 매출채권 잔액 5,146,472 · 청구 12줄 · 수납은 7/31 입금',
  LB.bal.매출채권 === 5146472 && LB.rows.filter(r => r.type === '청구').length === 12 &&
  LB.rows.filter(r => r.type === '수납').every(r => r.date === '2026-07-31')]);
/* 원장 잔액 — 청구 전부 − 수납 전부 */
const left = k => W.BILLS.filter(i => i.k === k).reduce((a, i) => a + i.amt - (W.PAID[i.id] || 0), 0);
const all12 = ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','본관1층','본관B2','별관4층','별관2층'];
r6.push(['미납 관리 — 비씨에이전시 5,146,472원만 남음 (루비뮤직 6월분 해소)', all12.every(n => left('b1' + n) === 0) && left('b1별관3층') === 5146472]);
r6.push(['PAY-1 8월 발행 화면의 미납 잔액 — 7월까지의 미납', W.dueOf('b1별관3층').amt === 5146472 && W.dueOf('b1별관3층').from === '2026-06']);
/* 현장 수납 — 입금 매칭을 다 끝낸 뒤 비씨에이전시가 현금 300만 원을 들고 왔다 → PAY-2 수납 처리 */
W.openPay('b1별관3층'); W.setPm('amt', 3000000);
const pc = W.payPlan();
W.payConfirm();
const LC = W.ledgerOf('b1별관3층');
r6.push(['현장 수납 현금 300만 — 오래된 달부터 · 미납 2,146,472 · 원장 매출채권 잔액 일치 · 「현금 수납」 기록',
  pc.lines[0].ym <= pc.lines[pc.lines.length - 1].ym && pc.rest === 0 && left('b1별관3층') === 2146472
  && LC.bal.매출채권 === 2146472 && LC.rows.some(r => r.type === '수납' && r.hand && / 현금$/.test(r.src))]);
const dep0 = LC.bal.임대보증금;
W.openPay('b1별관3층'); W.setPm('how', '보증금상계'); W.setPm('amt', 1000000); W.payConfirm();
const LD = W.ledgerOf('b1별관3층');
r6.push(['보증금상계 100만 — 미납 1,146,472 · 보증금 잔액 100만 감소 · 보증금 차감 행',
  left('b1별관3층') === 1146472 && LD.bal.매출채권 === 1146472 && LD.bal.임대보증금 === dep0 - 1000000
  && LD.rows.some(r => r.type === '보증금 차감' && r.dec === 1000000)]);
W.openPay('b1별관3층'); W.setPm('amt', 99999999); W.payConfirm();
r6.push(['미납보다 많이 받으면 확정되지 않음', left('b1별관3층') === 1146472]);
/* 연체료 — 받지 않으면 계속 쌓이고, 받으면 낮춘 금액만 청구·수납되고 그날까지는 다시 세지 않는다 → 4.4.3 */
const fee0 = W.feeUntil('b1별관3층', '2026-08-10');
W.openPay('b1별관3층'); W.setPm('feeMode', 'custom'); W.setPm('fee', '50000');
const amtF = W.pm.amt;
W.payConfirm();
const LF = W.ledgerOf('b1별관3층');
const feeRow = LF.rows.find(r => r.type === '청구' && /^연체료/.test(r.item));
r6.push(['연체료 낮춰 받기 — 68,433 중 5만 · 받을 금액 = 미납 + 5만 · 연체료 청구 5만(감면 표기) · 완납 · 남은 연체료 0',
  fee0 === 68433 && amtF === 1146472 + 50000 && left('b1별관3층') === 0 && LF.bal.매출채권 === 0
  && feeRow && feeRow.inc === 50000 && /감면/.test(feeRow.item) && W.feeUntil('b1별관3층', '2026-08-10') === 0]);
const ruby0 = W.feeUntil('b1본관B2', '2026-08-10');
W.openPay('b1본관B2'); W.setPm('feeMode', 'waive'); W.payConfirm();
r6.push(['연체료 전액 감면 — 루비뮤직 2,615 → 0 · 청구 없음',
  ruby0 === 2615 && W.feeUntil('b1본관B2', '2026-08-10') === 0 && !W.BILLS.some(i => i.k === 'b1본관B2' && i.fee)]);
/* 미납액 먼저 — 6월 미납이 있으면 7월 청구서와 같은 금액이 와도 6월부터 채운다 → 4.3.3 */
const V = new Function(stub + bare + '; return {rcPlan,BILLS};')();
{ const keep = V.BILLS.filter(i => !(i.k === 'b1본관302호' && i.ym !== '2026-07')); V.BILLS.length = 0; V.BILLS.push(...keep); }
V.BILLS.push({id:'2026-06|본관302호|고정관리비',ym:'2026-06',k:'b1본관302호',no:'본관302호',n:'고정관리비',pr:2,amt:1815000});
V.BILLS.push({id:'2026-06|본관302호|전기요금',ym:'2026-06',k:'b1본관302호',no:'본관302호',n:'전기요금',pr:4,amt:1865000});
const pv = V.rcPlan(13651511, ['b1본관302호'], {});
const jun = pv.lines.filter(l => l.ym === '2026-06').reduce((a, l) => a + l.pay, 0);
const jl = pv.lines.filter(l => l.ym === '2026-07');
r6.push(['미납액 먼저 — 6월 3,680,000 완납 · 7월 임대료 9,971,511 부분납',
  jun === 3680000 && jl.length === 1 && jl[0].n === '임대료' && jl[0].pay === 9971511 && jl[0].after === '부분납']);
/* 나눠 보낸 입금 — 백만 원 적게 보낸 뒤 나머지를 다음 날 같은 이름으로 보낸 경우 */
const S = new Function(stub + bare + '; return {RC,rcGuess,rcBiz,rcConfirm,ctrPay};')();
const s1 = {no:901,dt:'2026-07-31 12:34:01',kind:'PC뱅킹',name:'AMADEUS KO',amt:12694892,out:0};
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
r6.push(['첫 화면 — 7월 입금 대기 0건 · 비씨에이전시 미납 5,146,472 · 8월 청구 없음',
  O.rcOpenN() === 0 && O.dueOf('b1별관3층').amt === 5146472 && !O.BILLS.some(i => i.ym === '2026-08')]);
/* 월 마감 — 7월 카리나빌딩: 확인 항목 모두 통과 · 취소는 사유가 있어야 · 다시 마감 */
const M = new Function(stub + bare + '; seedJuly(); return {MC,MC_LOG,mcChecks,mcOpen,mcApply,get mcx(){return mcx;},s11};')();
const okAll = M.mcChecks('b1', '2026-07').every(x => x.ok);
M.mcOpen('undo'); M.mcApply(); const kept = !!M.MC.b1['2026-07'];
M.mcx.why = '수납 배분 재조정'; M.mcApply(); const undone = !M.MC.b1['2026-07'];
M.mcOpen('close'); M.mcApply();
r6.push(['월 마감 — 카리나빌딩 7월 확인 6항목 통과 · 사유 없으면 취소 안 됨 · 취소 후 다시 마감 · 이력 2줄',
  okAll && kept && undone && !!M.MC.b1['2026-07'] && M.MC_LOG['b1|2026-07'].length === 2]);
/* 연체료 50% 감면 · 연체료만 남은 계약도 미납 관리에 — 화면을 연 상태(7월 처리 완료)에서 */
const H = new Function(stub + bare + '; seedJuly(); return {openPay,setPm,payConfirm,ledgerOf,arrears,CTRS,get pm(){return pm;},f2,PAY2};')();
H.openPay('b1본관B2'); const rubyMode = H.pm.feeMode === 'full' && H.pm.amt === 2615;
H.openPay('b1별관3층'); H.setPm('feeMode', 'half');
const half = H.pm.fee === 34216 && H.pm.amt === 5146472 + 34216;
H.payConfirm();
const LH = H.ledgerOf('b1별관3층'), hRow = LH.rows.find(r => r.type === '청구' && /^연체료/.test(r.item));
r6.push(['연체료 50% 감면 — 68,433 → 34,216 받음 · 34,217 감면 표기 · 미납 0 · 루비뮤직은 연체료 전액이 기본',
  rubyMode && half && LH.bal.매출채권 === 0 && hRow && hRow.inc === 34216 && /34,217원 감면/.test(hRow.item)]);
r6.push(['연체료만 남은 루비뮤직도 미납 관리 기본 보기에', /본관B2/.test(H.PAY2())]);
/* 계약 등록 — 진행중 계약과 기간이 겹치면 막고, 끝난 다음 날부터는 등록된다 → CTR-2 */
const K = new Function(stub + bare + '; seedJuly(); return {CTR2,ncSet,ncSave,ncLookup,ncClash,CTRS,get nc(){return nc;},ctrEnd,ledgerOf};')();
K.CTR2(); K.ncSet('no', '본관302호'); K.ncSet('start', '2026-09-01');
const blk = K.ncClash() && K.ncClash().block;
K.nc.biz = '211-86-40519'; K.ncLookup(); K.ncSet('pmail', 'a@b.kr'); K.ncSet('rent', '3300000'); K.ncSet('mgmt', '550000');
const n0 = K.CTRS.length; K.ncSave(false); const kept2 = K.CTRS.length === n0;
K.ncSet('start', '2026-11-01'); const endAuto = K.nc.end === '2028-10-31';
K.ncSave(false); const needRf = K.CTRS.length === n0;
K.ncSet('rf', '있음'); K.ncSet('rfM', '1.5'); const r15 = K.nc.rfEnd === '2026-12-15';
K.ncSet('rfEnd', '2026-12-05'); const d35 = K.nc.rfEnd === '2026-12-05' && K.nc.rfM === '';
K.ncSave(false); const nw = K.CTRS[K.CTRS.length - 1];
r6.push(['계약 등록 — 겹침 차단 · 렌트프리 여부 필수 · 렌트프리 1.5개월 → 12/15 · 끝나는 날 12/5 직접 → 기산일 2026.12.06 · 부가세 포함 330만 → 공급가액 300만',
  blk && kept2 && endAuto && needRf && r15 && d35 && nw.from === '2026-12-06' && nw.rf.end === '2026-12-05' && nw.it[0][1] === 3000000 && nw.it[1][1] === 500000 && K.CTRS.length === n0 + 1 && nw.st === '준비중' && nw.ten === '(주)비씨에이전시'
  && K.ctrEnd(nw) === '2028-10-31' && nw.key === 'b1본관302호@2026-11-01' && !K.ledgerOf(nw.key).rows.some(r => r.type === '보증금 예치')
  && K.ledgerOf('b1본관302호').rows.some(r => r.type === '보증금 예치')]);
run('CTR-3 새로 등록한 계약', "seedJuly();CTRS.push({b:'b1',no:'본관302호',key:'b1본관302호@2026-11-01',ten:'(주)새임차',st:'준비중',base:'2026-11-01',end:'2028-10-31',rate:8,fresh:true,it:[['임대료',3000000],['고정관리비',500000]]});tab3c='원장';CTR3('b1본관302호@2026-11-01')+CTR1()");
const KW = new Function(stub + bare + '; return korWon;')();
r6.push(['금액 읽기 — 500만원 · 1억원 · 1억 2,345만 6,789원 · 55만원',
  KW(5000000) === '500만원' && KW(100000000) === '1억원' && KW(123456789) === '1억 2,345만 6,789원' && KW(550000) === '55만원']);
/* 일회성 청구 — 관리비 정산에서 넣으면 그 계약의 이번 청구서에 실린다 → PAY-10 · PAY-1 */
const Q = new Function(stub + bare + '; return {dApply,onceSet,ISSUE,ONCE,set dPick(v){dPick=v;}};')();
Q.dPick = ['once']; Q.dApply(); Q.onceSet(0, 'k', 'b1본관B2'); Q.onceSet(0, 'n', '엘리베이터 사용료'); Q.onceSet(0, 'amt', '110000');
const qb = Q.ISSUE().find(c => c.no === '본관B2'), ql = qb && qb.lines.find(l => l.n === '엘리베이터 사용료');
r6.push(['일회성 청구 11만 → 루비뮤직 8월 청구서에 한 줄 · 공급가액 100,000 · 부가세 10,000',
  Q.ONCE.on && ql && ql.amt === 110000 && ql.supply === 100000 && ql.vat === 10000]);
/* 항목별 저장 — 저장해야 ✓. 주차비는 저장 전이라 정산 확정 불가. 저장 후 고치면 다시 저장 전 → PAY-10 */
const SV = new Function(stub + bare + '; return {PAY10,saveItem,setDirect,SAVED,set pCode(v){pCode=v;}};')();
const lockRe = /disabled onclick="alert\('정산 확정/; const h0 = SV.PAY10(); const block0 = lockRe.test(h0) && !/저장 전/.test(h0);
SV.saveItem('parking'); const ok1 = !!SV.SAVED.parking && !lockRe.test(SV.PAY10());
SV.setDirect('parking', '본관8층', '80000'); const back = SV.SAVED.parking === null;
r6.push(['관리비 정산 항목 저장 — 주차비 저장 전이면 정산 확정 불가 · 저장하면 풀림 · 고치면 다시 저장 전', block0 && ok1 && back]);
/* 데이터셋이 맞물리는지 — 6·7월 청구서 화면의 합계 = 원장의 청구 합계 · 6월 거래내역 처리 결과 */
const D = new Function(stub + bare + '; return {withMonth,ISSUE,BILLS,f1,ctrPay,RC,BANKS,BILL_M};')();
const same = ['2026-06','2026-07'].every(ym => {
  D.f1.ym = ym; const scr = D.withMonth(ym, () => D.ISSUE().reduce((a, c) => a + c.sum, 0));
  return scr > 0 && scr === D.BILLS.filter(i => i.ym === ym).reduce((a, i) => a + i.amt, 0);});
const j6 = n => D.ctrPay('b1' + n, '2026-06');
const others6 = ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','본관1층','별관4층','별관2층'].every(n => j6(n).st === '완납');
const P6j = D.BANKS['2026-06'];
r6.push(['6·7월 청구서 화면 합계 = 원장 청구 · 6월 거래 18건(입금 11) · 6월 처리 후 비씨에이전시 미납 · 루비뮤직 385,000 부족 · 나머지 완납',
  same && P6j.rows.length === 18 && P6j.dep.length === 11 && P6j.dep.every(d => d.no > 100)
  && j6('별관3층').st === '미납' && j6('본관B2').due === 385000 && others6
  && D.BILL_M['2026-07'].elec.read['본관8층'][1] === D.BILL_M['2026-08'].elec.read['본관8층'][0]]);
/* 청구 약정 — 분기 고정액 추가 · 중지 · 조정 일정이 청구서 발행에 반영된다 → PAY-3 · PAY-1 */
const G = new Function(stub + bare + '; return {ciOpen,ciSet,ciSave,ciToggle,ISSUE,CTRS,CTR3items,get ci(){return ci;}};')();
const iss = no => G.ISSUE().find(c => c.no === no), ln = (no, n) => (iss(no).lines.find(l => l.n === n) || null);
/* 반복주기 — 고정관리비를 분기로: 기산일이 8월이면 8월 청구, 9월이면 8월 제외 */
G.ciOpen('b1별관3층', 'edit', '고정관리비'); G.ciSet('cycle', '분기'); G.ciSet('from', '2026-08-01'); G.ciSave();
const q8 = !!ln('별관3층', '고정관리비');
G.ciOpen('b1별관2층', 'edit', '고정관리비'); G.ciSet('cycle', '분기'); G.ciSet('from', '2026-09-01'); G.ciSave();
const q9 = !ln('별관2층', '고정관리비');
G.ciToggle('b1본관8층', '주차비'); const off = !ln('본관8층', '주차비');
G.ciToggle('b1본관8층', '주차비'); const onAgain = !!ln('본관8층', '주차비');
const list301 = G.CTR3items(G.CTRS.find(c => c.no === '본관301호'), 'b1본관301호');
/* 301호 고정관리비 켜기 — 금액을 넣는 패널이 열리고, 저장하면 청구서에 실린다 */
G.ciToggle('b1본관301호', '고정관리비'); const z = ln('본관301호', '고정관리비'), onNoPanel = G.ci === null && z && z.zero && z.amt === null;
G.ciOpen('b1본관301호', 'edit', '고정관리비'); G.ciSet('amt', '110000'); G.ciSave(); const m301 = ln('본관301호', '고정관리비');
G.ciOpen('b1본관301호', 'edit', '전기요금'); G.ciSet('memo', '302호 계량기 공유'); G.ciSave();
const offEdit = G.CTRS.find(c => c.no === '본관301호').meta['전기요금'].memo === '302호 계량기 공유' && !G.CTRS.find(c => c.no === '본관301호').it.some(x => x[0] === '전기요금');
const act301 = onNoPanel && m301 && m301.amt === 110000 && offEdit;
G.ciOpen('b1별관3층', 'adj'); G.ciSet('d', '2026-08-01'); G.ciSet('rent', '3630000'); G.ciSave();
const rent = ln('별관3층', '임대료');
const backToEdit = G.ci && G.ci.mode === 'edit' && G.ci.n === '임대료';
G.ciOpen('b1본관B2', 'payto'); G.ciSet('payTo', '본관2층'); G.ciSave(); const payTo = G.CTRS.find(c => c.no === '본관B2').payTo === '본관2층';
G.ciOpen('b1별관3층', 'edit', '고정관리비'); G.ciSet('amt', '1400000'); G.ciSave(); const noWhy = G.ci !== null;
G.ciSet('why', '재협의'); G.ciSave(); const fixed2 = G.ci === null && ln('별관3층', '고정관리비') && ln('별관3층', '고정관리비').amt === 1400000;
r6.push(['청구 약정 — 분기 · 기산일 8월 청구 · 9월 기산은 8월 제외 · 비활성화/활성화 · 301호 고정관리비 토글은 바로 켜지고(활성 0원은 청구서에 「금액 0원」) 수정에서 금액을 넣으면 청구 · 비활성 항목도 수정 가능 · 8/1 조정 일정 → 3,630,000(수정 패널 복귀) · 금액을 바꾸면 사유 필수 → 1,400,000 반영 · 정산액 부담',
  q8 && q9 && off && onAgain && /활성 1 \/ 9/.test(list301) && /고정관리비/.test(list301) && /class="tgl "/.test(list301) && /0원/.test(list301) && rent && rent.amt === 3630000 && backToEdit && noWhy && fixed2 && payTo && act301]);
/* 매월 항목 자동 · 계약 등록 시 건물 정산 항목 자동 → PAY-10 · CTR-2 */
{ const A = new Function(stub + bare + '; return {monthlyItems,BILL,MASTER,CTR2,ncSet,ncLookup,ncSave,CTRS,get nc(){return nc;}};')();
  const on = A.MASTER.filter(m => !m.fixed && A.BILL[m.code].on).map(m => m.code).sort().join();
  A.CTR2(); A.ncSet('no', '본관B1'); A.ncSet('start', '2026-09-01'); A.nc.biz = '999-99-99999'; A.ncLookup();
  A.ncSet('ten', '(주)새임차'); A.ncSet('pmail', 'a@b.kr'); A.ncSet('rent', '1100000'); A.ncSet('mgmt', '220000'); A.ncSet('rf', '없음'); A.ncSet('mgmtCy', '분기'); A.ncSave(false);
  const nw1 = A.CTRS[A.CTRS.length - 1];
  A.CTR2(); A.ncSet('b', 'b1'); A.ncSet('no', '별관4층'); A.ncSet('start', '2027-10-01'); A.nc.biz = '888-88-88888'; A.ncLookup();
  A.ncSet('ten', '(주)작은회사'); A.ncSet('pmail', 'b@c.kr'); A.ncSet('rent', '550000'); A.ncSet('rf', '없음');
  const n0 = A.CTRS.length; A.ncSave(false); const blank = A.CTRS.length === n0;
  A.ncSet('mgmt', '0'); A.ncSave(false);
  const nw2 = A.CTRS[A.CTRS.length - 1], noMgmt = blank && nw2.ten === '(주)작은회사' && nw2.it.find(x => x[0] === '고정관리비')[1] === 0 && nw2.meta['고정관리비'].stop === true;
  const nw = nw1, names = nw.it.map(x => x[0]);
  r6.push(['8월 항목 = 건물의 매월 항목 · 새 계약에 건물 정산 항목 7개 자동 · 고정관리비 반복주기 분기로 등록 · 고정관리비 빈칸은 막힘 · 0으로 등록하면 비활성',
    on === A.monthlyItems('b1').sort().join() && nw.ten === '(주)새임차' && names.length === 9 && names.includes('정화조청소비') && !nw.payTo && nw.meta['고정관리비'].cycle === '분기' && !(nw.meta['임대료'] || {}).cycle && noMgmt]); }
/* 안분 제외 = 계약 비활성 — 본관2층이 전기요금을 끄면 안분에서 빠지고 나머지가 나눠 낸다 · 새 계약이 이어받는다 → 4.1.7-2 */
{ const X = new Function(stub + bare + '; return {ciToggle,ciOpen,ciSet,ciSave,calc,M,ISSUE,CTRS,exclOf,CTR2,ncSet,ncLookup,ncSave,get nc(){return nc;}};')();
  const before = X.calc(X.M('elec')).rows.find(r => r.no === '본관1층').amt;
  X.ciToggle('b1본관2층', '전기요금'); X.ciOpen('b1본관2층', 'edit', '전기요금'); X.ciSet('offWhy', '한전 직접 계약'); X.ciSave();
  const R = X.calc(X.M('elec')), r2 = R.rows.find(r => r.no === '본관2층'), after = R.rows.find(r => r.no === '본관1층').amt;
  const ratioSum = R.rows.reduce((a, r) => a + r.ratio, 0);
  const noLine = !X.ISSUE().find(c => c.no === '본관2층').lines.some(l => l.n === '전기요금');
  const not301 = !X.exclOf('elec')['본관301호'];
  X.CTR2(); X.ncSet('no', '본관2층'); X.ncSet('start', '2028-03-01'); X.nc.biz = '777-77-77777'; X.ncLookup();
  X.ncSet('ten', '(주)다음임차'); X.ncSet('pmail', 'c@d.kr'); X.ncSet('rent', '9900000'); X.ncSet('mgmt', '3382500'); X.ncSet('rf', '없음'); X.ncSave(false);
  const nx = X.CTRS[X.CTRS.length - 1], inh = nx.ten === '(주)다음임차' && nx.meta['전기요금'].stop === true && nx.meta['전기요금'].why === '한전 직접 계약';
  r6.push(['안분 제외 = 계약 비활성 — 2층 전기 끄면 산출 결과 제외(사유) · 비율 합 1 · 1층 몫 증가 · 2층 청구서에 없음 · 301호(대납)는 제외 아님 · 새 계약이 이어받음',
    r2 && r2.excl && r2.excl.why === '한전 직접 계약' && Math.abs(ratioSum - 1) < 1e-9 && after > before && noLine && not301 && inh]); }
const bad6 = r6.filter(x => !x[1]);
if (bad6.length) fail = 1;
console.log('⑥ 수납 기록 ' + (bad6.length ? '✗ ' + bad6.map(x => x[0]).join(' / ') : 'OK — ' + r6.length + '개 검산'));
process.exit(fail);
