/* 목업 수정 후 반드시 실행한다.  node 검증.js
   문법 검사만으로는 함수 유실을 잡지 못한다. 호출부만 남아도 문법은 정상이다. */
const fs = require('fs'), path = require('path');
/* 파일명에 날짜판이 붙는다(brikka-mockup_YYYYMMDD.html). 하나만 있어야 한다 */
const files = fs.readdirSync(__dirname).filter(f => /^brikka-mockup_\d{8}\.html$/.test(f));
if (files.length !== 1) { console.log('✗ 목업 파일이 ' + files.length + '개다. brikka-mockup_YYYYMMDD.html 하나만 둔다: ' + files.join(', ')); process.exit(1); }
const file = path.join(__dirname, files[0]);
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
run('CTR-3 추가 청구 패널', "extraOpen('b1본관B2');extraSet('n','엘리베이터 사용료');extraSet('amt','110000');extraSet('memo','이사');extraSave();drawerHTML();tab3c='요약';CTR3('b1본관B2')");
run('PAY-10 배율 0', "BILL.elec.adj['본관2층']={mul:0};pCode='elec';PAY10()");
run('건물 관리비 설정 패널', "openCS('elec');drawerHTML();openCS('rent');drawerHTML();openCS('parking');drawerHTML()");
run('PAY-10 7월 마감 회차', "f10ym='2026-07';PAY10()");
for (const c of ['elec','water','fund','tv','parking']) run('PAY-10 6월 ' + c, "f10ym='2026-06';pCode='" + c + "';PAY10()");
run('PAY-13 6월', "RC.f.ym='2026-06';PAY13()");
run('PAY-6 6월', "RC.f.ym='2026-06';g6All=true;PAY6()");
run('PAY-10 6월 · 마감 취소 후', "delete MC.b1['2026-06'];f10ym='2026-06';PAY10()");
run('PAY-1 7월 마감 회차', "f1.ym='2026-07';PAY1()");
run('PAY-1 6월 마감 취소 후 · 다른 건물', "delete MC.b1['2026-06'];f1.ym='2026-06';PAY1();f1.b='b2';PAY1()");
run('PAY-13 7월 잠금', "seedJuly();RC.f.ym='2026-07';PAY13()");
run('CTR-2 자료', "nc=null;CTR2();ncFile();ncFile();ncRow('files',0,'c','기타');CTR2()");
run('CTR-3 청구 정정 패널(덜 받기 · 더 받기)', "seedJuly();fixOpen('b1본관1층');drawerHTML();extraOpen('b1본관1층');drawerHTML();fixOpen('b1본관1층');cutSet('id','2026-07|본관1층|전기요금');cutSet('amt','10000');drawerHTML()");
run('PAY-1 발행 · 취소 패널 · 메일', "f1.b='b2';PAY1();issue1(['b21203호']);PAY1();cancelOpen('b21203호');cancelHTML();cx1.why='약정 오기';cancelOK();mail1=false;PAY1()");
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
run('PRO-3 관리비 설정 패널 — 임대료 · 전기요금 같은 구성', "loadCS('rent');DRAWER='chargeset';const a=csHTML();loadCS('elec');const b=csHTML();if(!/근거 문서/.test(a)||!/배분 방식/.test(a)||!/disabled/.test(a))throw new Error('구성 다름')");
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
run('CTR-3 청구·수납', "seedJuly();tab3c='청구·수납';g7={'2026-07':true,'2026-06':true};CTR3('b1별관3층')+CTR3('b1본관1층')+CTR3('b1본관B2')+CTR3('b21203호')");
run('CTR-3 빈 탭', "tab3c='자료보관';CTR3('b1별관3층')");
run('CTR-3 임대료·관리비', "tab3c='임대료·관리비';CTR3('b1별관3층')+CTR3('b1본관301호')");
run('CTR-3 계약 전환 메뉴', "CSW=true;tab3c='원장';CTR3('b1별관3층')");
run('CTR-3 청구항목 패널', "ciOpen('b1별관3층','edit','임대료');ciSet('amt','1');ciHTML();ciOpen('b1별관3층','edit','고정관리비');ciHTML();ciOpen('b1별관3층','adj');ciHTML();ciOpen('b1별관3층','payto');ciHTML()");
run('CTR-3 원장 비씨에이전시', "tab3c='원장';CTR3('b1별관3층')");
run('CTR-3 원장 전체 펼침', "tab3c='원장';g3All=true;CTR3('b1본관1층')");
run('CTR-3 원장 필터', "tab3c='원장';f3={per:'3',acc:'매출채권'};CTR3('b1본관302호')");
run('CTR-3 없는 계약', "CTR3('b9없음')");
run('PAY-2 펼침 · 달별 미납 상세 패널', "seedJuly();g2All=true;PAY2();openDue('b1별관3층','2026-06');dueHTML();openDue('b1별관3층','2026-07');dueHTML();openDue('b1본관B2','2026-06');dueHTML()");
run('PAY-2 종료 계약', "f2.cs='종료';PAY2()");
run('PAY-2 다른 건물', "f2.b='b2';PAY2()");
run('PAY-2 연체일수 필터', "seedJuly();f2.dd='30';PAY2();f2.dd='90';PAY2()");
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
r6.push(['미리보기 — 비씨에이전시 6월은 마감(07.03)이라 미납액 한 줄 5,054,474 + 7월 6개 항목 · 미납액부터 채우고 배분 후 미납 5,146,472',
  pvB.all.length === 7 && pvB.lines[0].n === '전월 미납액' && pvB.lines[0].due === 5054474 && pvB.all.reduce((a, l) => a + l.due - l.pay, 0) === 5146472]);
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
r6.push(['분리 입금 — 13,200,000은 임대료에(전월 과납액은 작은 항목부터 채웠다)', got[7].lines.length === 1 && got[7].lines[0].n === '임대료' && got[7].lines[0].pay === 13200000]);
r6.push(['분리 입금 — 나머지는 같은 계약에', got[6].was === '자동' && got[6].rest === 0 && got[6].lines.every(l => l.no === '본관1층')]);
r6.push(['입금자명 등록 후 같은 이름 입금 자동', got[4].was === '자동' || got[3].was === '자동']);
r6.push(['입금 1건 → 계약 2개 (ICB)', new Set(got[5].lines.map(l => l.no)).size === 2 && got[5].rest === 0]);
r6.push(['입금 1건 → 계약 2개 (좋은생각사람들)', new Set(got[24].lines.map(l => l.no)).size === 2 && got[24].rest === 0]);
r6.push(['임차인 입금 12건 전부 전액 배분', [1,2,3,4,5,6,7,8,9,10,12,24].every(n => got[n] && got[n].rest === 0)]);
r6.push(['대기 0건 — 모두 처리', W.rcNext() === null && W.rcOpenN() === 0]);
/* 계약별 납부상태 — 비씨에이전시 6월 부분납 · 7월 미납(마감 경과, 수납 0), 루비뮤직 6월 미납분 해소 → PAY-6 · 3.2 */
const st6 = (n, ym) => W.ctrPay('b1' + n, ym || '2026-07').st;
const c7B = W.ctrPay('b1본관B2', '2026-07').carry;
r6.push(['수납 내역 — 비씨에이전시 6월 미납(마감 때 굳음) · 7월 미납',
  st6('별관3층', '2026-06') === '미납' && st6('별관3층') === '미납']);
r6.push(['수납 내역 — 나머지 12계약 7월 완납 · 루비뮤직 6월은 385,000 덜 내고 마감해 미납으로 굳고, 7월의 미납액 385,000은 7/31 입금으로 다 받음',
  ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','본관1층','본관B2','별관4층','별관2층'].every(n => st6(n) === '완납')
  && st6('본관B2', '2026-06') === '미납' && c7B && c7B.amt === 385000 && c7B.due === 0]);
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
const left = k => W.ledgerOf(k).bal.매출채권;   /* 원장의 받을 돈 — 미납액에 들어간 돈까지 반영된다 */
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
r6.push(['나눠 보낸 입금 — 1차 후 100만 남음(7월 마감 뒤라 미납) → 2차(08.01, 마감 전) 자동 매칭 → 완납',
  mid.st === '미납' && mid.due === 1000000 && auto2 && end.st === '완납' && end.due === 0]);
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
/* 추가 청구 — 계약 상세에서 넣으면 그 계약의 다음 청구서에 실린다 → CTR-3 · PAY-1 */
const Q = new Function(stub + bare + '; return {extraOpen,extraSet,extraSave,ISSUE,ONCE};')();
Q.extraOpen('b1본관B2'); Q.extraSet('n', '엘리베이터 사용료'); Q.extraSet('amt', '110000'); Q.extraSet('memo', '이사'); Q.extraSave();
const qb = Q.ISSUE().find(c => c.no === '본관B2'), ql = qb && qb.lines.find(l => l.n === '엘리베이터 사용료');
r6.push(['추가 청구 11만(계약 상세) → 루비뮤직 8월 청구서에 한 줄 · 공급가액 100,000 · 부가세 10,000',
  Q.ONCE.rows.length === 1 && ql && ql.amt === 110000 && ql.supply === 100000 && ql.vat === 10000]);
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
const others6 = ['본관8층','본관7층','본관6층','본관5층','본관4층','본관301호','본관302호','본관2층','별관4층','별관2층'].every(n => j6(n).st === '완납')
  && j6('본관1층').st === '과납' && j6('본관1층').over === 18000;   /* 에스씨케이컴퍼니는 6월에 18,000 더 냈다 */
const P6j = D.BANKS['2026-06'];
r6.push(['6·7월 청구서 화면 합계 = 원장 청구 · 6월 거래 18건(입금 11) · 6월 처리 후 비씨에이전시 미납 · 루비뮤직 385,000 부족 · 에스씨케이컴퍼니 과납 18,000 · 나머지 완납',
  same && P6j.rows.length === 18 && P6j.dep.length === 11 && P6j.dep.every(d => d.no > 100)
  && j6('별관3층').st === '미납' && j6('본관B2').due === 385000 && others6
  && D.BILL_M['2026-07'].elec.read['본관8층'][1] === D.BILL_M['2026-08'].elec.read['본관8층'][0]]);
/* 청구 약정 — 분기 고정액 추가 · 중지 · 조정 일정이 청구서 발행에 반영된다 → PAY-3 · PAY-1 */
const G = new Function(stub + bare + '; return {ciOpen,ciSet,ciSave,ISSUE,CTRS,CTR3rent,get ci(){return ci;}};')();
const iss = no => G.ISSUE().find(c => c.no === no), ln = (no, n) => (iss(no).lines.find(l => l.n === n) || null);
/* 반복주기 — 고정관리비를 분기로: 기산일이 8월이면 8월 청구, 9월이면 8월 제외 */
G.ciOpen('b1별관3층', 'edit', '고정관리비'); G.ciSet('cycle', '분기'); G.ciSet('from', '2026-08-01'); G.ciSave();
const q8 = !!ln('별관3층', '고정관리비');
G.ciOpen('b1별관2층', 'edit', '고정관리비'); G.ciSet('cycle', '분기'); G.ciSet('from', '2026-09-01'); G.ciSave();
const q9 = !ln('별관2층', '고정관리비');
/* 정산 항목은 건물 관리비 설정을 그대로 받는다 */
const noElec = G.ISSUE().filter(c => c.b === 'b1' && !c.lines.some(l => /전기요금/.test(l.n))).map(c => c.no).join();
const elecAll = noElec === '본관301호' && G.ISSUE().find(c => c.no === '본관302호').lines.filter(l => /수도요금/.test(l.n)).length === 2; /* 301호 전기는 302호 계량기로, 수도는 302호가 대납 */
/* 301호 고정관리비 0원 = 청구 안 함 · 수정에서 금액을 넣으면 청구 */
const t301 = G.CTR3rent(G.CTRS.find(c => c.no === '본관301호'), 'b1본관301호');
const zero301 = !ln('본관301호', '고정관리비') && /고정관리비/.test(t301) && /청구 안 함/.test(t301) && !/전기요금/.test(t301) && !/class="tgl/.test(t301);
G.ciOpen('b1본관301호', 'edit', '고정관리비'); G.ciSet('amt', '110000'); G.ciSave(); const m301 = ln('본관301호', '고정관리비');
const act301 = zero301 && m301 && m301.amt === 110000;
G.ciOpen('b1별관3층', 'adj'); G.ciSet('d', '2026-08-01'); G.ciSet('rent', '3630000'); G.ciSave();
const rent = ln('별관3층', '임대료'), closed = G.ci === null && /3,630,000/.test(G.CTR3rent(G.CTRS.find(c => c.no === '별관3층'), 'b1별관3층'));
G.ciOpen('b1본관B2', 'payto'); G.ciSet('payTo', '본관2층'); G.ciSave(); const payTo = G.CTRS.find(c => c.no === '본관B2').payTo === '본관2층';
G.ciOpen('b1별관3층', 'edit', '고정관리비'); G.ciSet('amt', '1400000'); G.ciSave(); const noWhy = G.ci !== null;
G.ciSet('why', '재협의'); G.ciSave(); const fixed2 = G.ci === null && ln('별관3층', '고정관리비') && ln('별관3층', '고정관리비').amt === 1400000;
r6.push(['임대료·관리비 탭 — 분기 · 기산일 8월 청구 · 9월 기산은 8월 제외 · 정산 항목은 건물 설정 그대로 · 301호 고정관리비 0원은 청구 안 함, 금액을 넣으면 청구 · 8/1 인상 예약 → 3,630,000 · 금액을 바꾸면 사유 필수 → 1,400,000 반영 · 정산액 대납',
  q8 && q9 && elecAll && act301 && rent && rent.amt === 3630000 && closed && noWhy && fixed2 && payTo]);
/* 매월 항목 자동 · 계약에는 고정액 2개만 → PAY-10 · CTR-2 */
{ const A = new Function(stub + bare + '; return {monthlyItems,BILL,MASTER,CTR2,ncSet,ncLookup,ncSave,CTRS,ISSUE,get nc(){return nc;}};')();
  const on = A.MASTER.filter(m => !m.fixed && A.BILL[m.code].on).map(m => m.code).sort().join();
  A.CTR2(); A.ncSet('no', '본관B1'); A.ncSet('start', '2026-09-01'); A.nc.biz = '999-99-99999'; A.ncLookup();
  A.ncSet('ten', '(주)새임차'); A.ncSet('pmail', 'a@b.kr'); A.ncSet('rent', '1100000'); A.ncSet('mgmt', '220000'); A.ncSet('rf', '없음'); A.ncSet('mgmtCy', '분기'); A.ncSave(false);
  const nw1 = A.CTRS[A.CTRS.length - 1];
  A.CTR2(); A.ncSet('b', 'b1'); A.ncSet('no', '별관4층'); A.ncSet('start', '2027-10-01'); A.nc.biz = '888-88-88888'; A.ncLookup();
  A.ncSet('ten', '(주)작은회사'); A.ncSet('pmail', 'b@c.kr'); A.ncSet('rent', '550000'); A.ncSet('rf', '없음');
  const n0 = A.CTRS.length; A.ncSave(false); const blank = A.CTRS.length === n0;
  A.ncSet('mgmt', '0'); A.ncSave(false);
  const nw2 = A.CTRS[A.CTRS.length - 1], noMgmt = blank && nw2.ten === '(주)작은회사' && nw2.it.find(x => x[0] === '고정관리비')[1] === 0;
  const names = nw1.it.map(x => x[0]).join();
  r6.push(['8월 항목 = 건물의 매월 항목 · 새 계약에는 임대료·고정관리비만 · 고정관리비 반복주기 분기로 등록 · 고정관리비 빈칸은 막힘 · 0으로 등록 가능(청구 안 함)',
    on === A.monthlyItems('b1').sort().join() && nw1.ten === '(주)새임차' && names === '임대료,고정관리비' && !nw1.payTo && nw1.meta['고정관리비'].cycle === '분기' && !(nw1.meta['임대료'] || {}).cycle && noMgmt]); }
/* 공용분에서 한 유닛 빼기 = 배율 0 — 공용분만 0, 개별 사용량은 그대로 청구. 나머지가 나눠 내고 합계는 고지서와 같다 → 4.1.2 · 4.1.7 */
{ const X = new Function(stub + bare + '; return {calc,M,BILL};')();
  const before = X.calc(X.M('elec')).rows.find(r => r.no === '본관1층').amt;
  X.BILL.elec.adj['본관2층'] = { mul: 0 };
  const R = X.calc(X.M('elec')), r2 = R.rows.find(r => r.no === '본관2층'), after = R.rows.find(r => r.no === '본관1층').amt;
  const ratioSum = R.rows.reduce((a, r) => a + r.ratio, 0);
  r6.push(['공용분 빼기 = 배율 0 — 2층 공용분 0 · 개별분은 청구 · 비율 합 1 · 1층 몫 증가 · 합계 = 고지서',
    r2.common === 0 && r2.amt > 0 && Math.abs(ratioSum - 1) < 1e-9 && after > before && R.diff === 0]); }
/* 감액 · 과납 — 8/7 본관1층 7월 수도요금 18,000 감액. 7월분은 07.31에 완납이라 과납 18,000이 된다 → CTR-3 · 4.3.4 */
{ const OV = new Function(stub + bare + '; const pre=ctrPay("b1본관1층","2026-07"); seedJuly(); addCut("2026-07|본관1층|수도요금",18000,"2026-08-07","7월 수도 검침값 입력 오류"); return {pre,ctrPay,overOf,ledgerOf,CTRS,PAY1,CTR3,ISSUE,mcChecks,openRefund,ovSet,ovConfirm,cutOpen,cutSet,cutConfirm,set tab3c(v){tab3c=v;}};')();
  const k = 'b1본관1층', L = OV.ledgerOf(k), cut = L.rows.find(r => r.type === '감액');
  const post = OV.ctrPay(k, '2026-07'), item = post.it.find(i => i.n === '수도요금');
  const mv = L.rows.filter(r => r.g === cut.g);
  const shown = OV.ISSUE().find(c => c.no === '본관1층').over === 18000 && /−18,000원/.test(OV.PAY1());
  r6.push(['감액 — 본관1층 7월 수도 18,000 · 원장엔 08.07 감액 한 줄(넘친 수납을 과납으로 돌린 일은 적지 않음) · 원장 잔액 −18,000 = 과납 · 7월은 08.05 마감 모습 그대로(수도 1,337,087 받음 · 완납 · 과납액 없음) · 8월 청구서에 −18,000 · 7월 마감 확인 통과',
    cut && cut.dec === 18000 && cut.date === '2026-08-07' && mv.length === 1 && !L.rows.some(r => r.type === '수납 취소')
    && L.bal.매출채권 === -18000 && OV.overOf(k) === 18000
    && post.bill === OV.pre.bill && post.paid === post.bill && item.paid === 1337087 && item.st === '완납' && post.over === 0 && post.st === '완납'
    && shown && OV.mcChecks('b1', '2026-07').every(x => x.ok)]);
  OV.tab3c = '원장'; const btnOn = !/disabled title="돌려줄 과납이 없습니다"/.test(OV.CTR3(k));
  OV.openRefund(k); OV.ovSet('amt', '20000'); OV.ovConfirm(); const over1 = OV.overOf(k) === 18000;
  OV.ovSet('amt', '10000'); OV.ovSet('acct', '기업 123-45'); OV.ovConfirm(); const part = OV.overOf(k) === 8000;
  OV.openRefund(k); OV.ovConfirm();
  const L2 = OV.ledgerOf(k), rfs = L2.rows.filter(r => r.type === '환불');
  r6.push(['원장 환불 — 과납보다 많으면 막힘 · 10,000 일부 환불 → 과납 8,000 · 나머지 8,000 환불 → 잔액 0 · 환불 거래 2건 · 그 뒤 환불 버튼 잠김',
    btnOn && over1 && part && rfs.length === 2 && rfs.reduce((a, r) => a + r.inc, 0) === 18000 && L2.bal.매출채권 === 0
    && /disabled title="돌려줄 과납이 없습니다"/.test(OV.CTR3(k))]);
  /* 감액 패널 — 남은 청구액을 넘으면 막고, 사유가 없으면 막는다 */
  OV.cutOpen('2026-07|본관1층|전기요금'); OV.cutSet('amt', '99999999'); OV.cutSet('why', '시험'); OV.cutConfirm();
  const blocked = !OV.ledgerOf(k).rows.some(r => r.type === '감액' && r.dec === 99999999);
  OV.cutOpen('2026-07|본관1층|전기요금'); OV.cutSet('amt', '5000'); OV.cutConfirm(); const noWhy = OV.ledgerOf(k).rows.filter(r => r.type === '감액').length === 1;
  r6.push(['감액 패널 — 청구액 초과 막힘 · 사유 없으면 막힘', blocked && noWhy]); }
/* 오납 — 7월 SK렌터카(주) 1,938,620 입금을 오납으로 → 7월 마감 확인에 걸림 · 입금 매칭에서 환불 기록하면 풀림. 원장에는 없다 → 4.3.5 */
{ const MS = new Function(stub + bare + '; seedJuly(); return {RC,rcUnignore,rcMis,rcOpenN,PAY13,mcChecks,openMis,ovSet,ovConfirm,ledgerOf};')();
  MS.RC.f.ym = '2026-07'; MS.rcUnignore(55); MS.rcMis(55); MS.RC.cur = 55;
  const listed = /환불 기록/.test(MS.PAY13()) && MS.rcOpenN() === 0;
  const blockedJul = !MS.mcChecks('b1', '2026-07').find(x => x.t === '돌려주지 않은 오납').ok;
  MS.openMis(55); MS.ovSet('acct', '신한 110-1'); MS.ovConfirm(); MS.RC.cur = 55;
  const refunded = MS.RC.dec[55].mis.refund && MS.mcChecks('b1', '2026-07').every(x => x.ok) && /환불함/.test(MS.PAY13());
  r6.push(['오납 — 입금 매칭에서 오납 표시 · 대기 0건 · 7월 마감 확인에 걸림 · 같은 화면에서 환불 기록하면 풀림', listed && blockedJul && refunded]); }
/* 입금이 미납보다 많으면 — 남는 돈은 마지막으로 배분된 계약의 과납 */
{ const S2 = new Function(stub + bare + '; return {RC,rcConfirm,ctrPay,overOf,ledgerOf};')();
  const due = S2.ctrPay('b1본관6층', '2026-07').due;
  S2.RC.P.dep = [{no:903, dt:'2026-07-31 12:34:01', kind:'PC뱅킹', name:'AMADEUS KO', amt:due + 50000, out:0}];
  S2.RC.pre[903] = '아마데우스'; S2.rcConfirm(903);
  const L3 = S2.ledgerOf('b1본관6층');
  const p7 = S2.ctrPay('b1본관6층', '2026-07');
  r6.push(['입금 남음 — 아마데우스 7월 미납 + 50,000 입금 → 항목은 모두 완납 · 7월 과납액 50,000 · 납부상태 과납 · 원장에 청구 없는 수납 50,000',
    p7.st === '과납' && p7.over === 50000 && p7.it.every(i => i.st === '완납') && S2.overOf('b1본관6층') === 50000 && L3.bal.매출채권 === -50000
    && L3.rows.some(r => r.type === '수납' && r.dec === 50000 && /과납/.test(r.item))]); }
run('환불 패널 · 오납 환불 패널', "seedJuly();openRefund('b1본관1층');overHTML();ovSet('amt','99999');overHTML();RC.f.ym='2026-07';rcUnignore(55);rcMis(55);RC.cur=55;PAY13();openMis(55);overHTML()");
run('PAY-6 과납 필터', "seedJuly();RC.f={b:'b1',ym:'2026-07',st:'과납'};g6All=true;PAY6()");
run('PAY-13 감액으로 과납이 생긴 입금 · 남는 입금 미리보기', "seedJuly();RC.f.ym='2026-07';RC.cur=6;PAY13();RC.f.ym='2026-07';delete RC.dec[8];RC.cur=8;PAY13()");
run('CTR-3 원장 감액 · 요약 과납', "seedJuly();tab3c='원장';g3All=true;CTR3('b1본관1층');tab3c='요약';CTR3('b1본관1층')");
run('감액 패널', "seedJuly();cutOpen('2026-07|본관1층|전기요금');cutSet('amt','10000');fixHTML();cutSet('amt','99999999');fixHTML()");
run('PAY-1 과납', "seedJuly();g1All=true;PAY1()");
run('PAY-11 8월 과납 확인', "seedJuly();s11={b:'b1',ym:'2026-08'};PAY11();mcOpen('close');mcHTML()");
/* 미납 이월 — 6월 마감(07.03) 때 비씨에이전시 5,054,474가 미납액으로 · 7/31 입금은 미납액에 · 7월 마감(08.05) 때 54,474 + 5,091,998 → 4.3.6 */
{ const CF = new Function(stub + bare + '; seedJuly(); return {ledgerOf,carryAmt,carryParts,ctrPay,MC,mcCarryUsed,mcOpen,mcApply,lateCalc,get mcx(){return mcx;},set s11(v){s11=v;}};')();
  const k = 'b1별관3층', L = CF.ledgerOf(k);
  const noCf = !L.rows.some(r => r.type === '미납 이월'), cp = L.rows.filter(r => r.item === '전월 미납액');
  const p7 = CF.carryParts(k, '2026-07');
  const jun = CF.ctrPay(k, '2026-06'), jul = CF.ctrPay(k, '2026-07');
  r6.push(['미납 이월 — 6월 마감 때 5,054,474 · 7월 마감 때 54,474(6월분) + 5,091,998(7월분) = 5,146,472 · 원장엔 이월 줄 없이 7/31 「전월 미납액」 수납 5,000,000만 · 6월은 수납 0·미납으로 굳음 · 연체료 그대로',
    CF.carryAmt(k, '2026-06') === 5054474 && CF.carryAmt(k, '2026-07') === 5146472
    && p7.length === 2 && p7[0].ym === '2026-06' && p7[0].amt === 54474 && p7[1].amt === 5091998
    && noCf && cp.length === 1 && cp[0].dec === 5000000 && L.bal.매출채권 === 5146472
    && jun.paid === 0 && jun.st === '미납' && jul.carry.amt === 5054474 && jul.carry.paid === 5000000 && jul.st === '미납'
    && CF.lateCalc(k, '2026-06').fee === 51693]);
  const used6 = CF.mcCarryUsed('b1', '2026-06'), used7 = CF.mcCarryUsed('b1', '2026-07');
  CF.s11 = {b:'b1', ym:'2026-06'}; CF.mcOpen('undo'); CF.mcx.why = '시험'; CF.mcApply(); const kept6 = !!CF.MC.b1['2026-06'];
  r6.push(['마감 취소 — 6월은 미납액에 7/31 입금이 들어가 취소 불가 · 7월은 가능', used6 && !used7 && kept6]); }
run('PAY-11 6월 마감 취소 패널(막힘)', "seedJuly();s11={b:'b1',ym:'2026-06'};mcOpen('undo');mcHTML()");
run('CTR-3 원장 미납 이월', "seedJuly();tab3c='원장';g3All=true;CTR3('b1별관3층')+CTR3('b1본관B2')");
/* 전월 과납액 — 에스씨케이컴퍼니 6월 과납 18,000 → 7/19 7월 청구에 먼저 배분 · 7월 입금은 그만큼 적고 완납 · 잔액 0 · 6월 입금 화면에 7월 청구가 섞이지 않음 */
{ const CR = new Function(stub + bare + '; seedJuly(); return {ctrPay,ledgerOf,CREDITS,RC,overOf};')();
  const k = 'b1본관1층', j7 = CR.ctrPay(k, '2026-07'), L = CR.ledgerOf(k), g = L.rows.filter(r => r.g === 'paycr2026-07' || /전월 과납액/.test(r.item || ''));
  const jun = ['105','106','108','109'].every(no => (CR.RC.dec[no].done.all || []).every(l => l.ym === '2026-06'));
  r6.push(['전월 과납액 — 6월 과납 18,000이 7/19 7월 청구에 배분(원장엔 적지 않음) · 7월 완납 · 청구 19,202,814 − 18,000 = 받을 돈 19,184,814 · 잔액 0 · 6월 입금 화면엔 6월 청구만',
    CR.CREDITS.length === 1 && CR.CREDITS[0].amt === 18000 && j7.credit === 18000 && j7.st === '완납'
    && g.length === 0 && L.bal.매출채권 === 0 && CR.overOf(k) === 0 && jun]); }
/* 청구서 취소 — 발행한 뒤 입금이 없고 마감 전이면 취소하고 다시 발행 · 사유가 없으면 막힘 · 마감한 달·입금 있는 청구는 막힘 → PAY-1 */
{ const IS = new Function(stub + bare + '; seedJuly(); return {issue1,cancelOpen,cancelOK,cancelBlock,ISS,ISS_LOG,ISSUE,CTRS,set f1b(v){f1.b=v;},get cx1(){return cx1;}};')();
  IS.f1b = 'b2'; IS.issue1(['b21203호']);
  const issued = IS.ISSUE().find(c => c.no === '1203호').st === '발행 완료';
  IS.cancelOpen('b21203호'); IS.cancelOK(); const noWhy = !!IS.ISS['b21203호'];
  IS.cx1.why = '약정 오기'; IS.cancelOK();
  const back = IS.ISSUE().find(c => c.no === '1203호').st === '발행 대기' && IS.ISS_LOG.length === 1;
  const c1 = IS.CTRS.find(c => c.no === '본관1층'), c3 = IS.CTRS.find(c => c.no === '별관3층');
  r6.push(['청구서 취소 — 발행 → 사유 없으면 막힘 → 취소하면 발행 대기 · 7월(마감)·입금 있는 청구는 취소 불가',
    issued && noWhy && back && /마감/.test(IS.cancelBlock(c3, '2026-07')) && !!IS.cancelBlock(c1, '2026-07')]); }
/* 전월 과납액은 우선순위가 낮은 항목부터 — 에스씨케이컴퍼니 13,200,000 입금이 임대료에 그대로 들어간다 */
{ const PR = new Function(stub + bare + '; seedJuly(); return {RC};')();
  const d7 = PR.RC.dec[7].done;
  r6.push(['전월 과납액은 우선순위가 가장 낮은 수도요금(6)에 18,000을 채움 → 13,200,000 입금은 임대료 한 줄',
    d7.lines.length === 1 && d7.lines[0].n === '임대료' && d7.lines[0].pay === 13200000]); }
/* 청구 정정 — 덜 받기·더 받기가 같은 칸(청구 항목 · 금액 · 사유)과 같은 버튼(정정 확정) · 더 받기도 사유 필수 · 지난 청구를 더 받으면 「…월분 ○○ 정정」 */
{ const FX = new Function(stub + bare + '; seedJuly(); return {fixOpen,fxSet,fxConfirm,fixHTML,ONCE,ISSUE,get fz(){return fz;}};')();
  FX.fixOpen('b1본관1층', 'cut'); const hc = FX.fixHTML();
  FX.fixOpen('b1본관1층', 'add'); const ha = FX.fixHTML();
  const same = ['청구 항목', '금액', '사유', '정정 확정', '정정 내역'].every(t => hc.includes(t) && ha.includes(t)) && !ha.includes('항목명');
  FX.fxSet('id', '2026-07|본관1층|전기요금'); FX.fxSet('amt', '55000'); FX.fxConfirm(); const noWhy = FX.ONCE.rows.length === 0;
  FX.fxSet('why', '7월 검침 누락'); FX.fxConfirm();
  const r = FX.ONCE.rows[0], ln = FX.ISSUE().find(c => c.no === '본관1층').lines.find(l => /정정/.test(l.n));
  r6.push(['청구 정정 — 두 방향 같은 칸·같은 버튼 · 사유 없으면 막힘 · 7월 전기요금 더 받기 55,000 → 8월 청구서에 「26.07월분 전기요금 정정」(세금계산서)',
    same && noWhy && r && r.n === '26.07월분 전기요금 정정' && r.doc === '세금계산서' && ln && ln.amt === 55000]); }
/* 청구서 발행 — 메일 체크박스·미납 조회 없음 · 발행을 누르면 메일 여부를 묻는다 · 더보기로 한 계약만 발행 */
{ const IA = new Function(stub + bare + '; seedJuly(); return {PAY1,issueAsk,issueGo,issueHTML,ISS,MORE,set f1b(v){f1.b=v;}};')();
  IA.f1b = 'b2'; IA.MORE.length = 0; const h = IA.PAY1();
  const m = IA.MORE.find(x => x[0].go === `issueAsk(['b21203호'])`);
  IA.issueAsk(['b21203호']); const ask = IA.issueHTML(); IA.issueGo(false);
  r6.push(['청구서 발행 — 메일 체크박스·미납 조회 없음 · 더보기 「청구서 발행」 → 메일 여부 묻기 → 메일 없이 발행',
    !h.includes('메일 보내기') && !h.includes('미납 조회') && m && !m[0].off && !!m[1].off
    && /메일을 보내시겠습니까/.test(ask) && IA.ISS['b21203호'] && IA.ISS['b21203호'].mail === false]); }
/* 주차면 — 배정 변경(해제 → 다른 계약) · 배정된 주차면은 삭제 안 됨 · 추가는 이름 필수 */
{ const PK = new Function(stub + bare + '; seedJuly(); return {BUILDINGS,pkOpen,pkSave,pkDel,pkHTML,get pk(){return pk;}};')();
  const b = PK.BUILDINGS.find(x => x.id === 'b1'), n0 = b.parks.length;
  PK.pkDel('b1', 0); const kept = b.parks.length === n0;
  PK.pkOpen('b1', 3, 'assign'); PK.pk.k = '본관1층'; PK.pkSave(); const asg = b.parks[3].asu === '본관1층' && b.parks[3].as === '(주)에스씨케이컴퍼니';
  PK.pkOpen('b1', 3, 'assign'); PK.pk.k = ''; PK.pkSave(); PK.pkDel('b1', 3); const del = b.parks.length === n0 - 1;
  PK.pkOpen('b1', -1, 'edit'); PK.pkSave(); const noName = b.parks.length === n0 - 1;
  PK.pkOpen('b1', -1, 'edit'); PK.pk.n = 'M-02'; PK.pk.loc = '기계식'; PK.pkSave();
  r6.push(['주차면 — 배정된 면 삭제 막힘 · 배정 변경 · 해제 후 삭제 · 이름 없으면 추가 안 됨 · 기계식 추가',
    kept && asg && del && noName && b.parks.at(-1).n === 'M-02' && b.parks.at(-1).loc === '기계식']); }
/* 건물 등록 — 빠진 필수 항목은 막힘 · 지분 합계 100% · 별칭 중복 막힘 · 저장하면 목록에 생기고 상세가 열림 */
{ const NB = new Function(stub + bare + '; return {PRO2,PRO3,nbSave,nbMissing,BUILDINGS,get nb(){return nb;}};')();
  NB.PRO2(); NB.nbSave(); const blocked = NB.BUILDINGS.length === 3 && NB.nbMissing().includes('건물명');
  Object.assign(NB.nb, {name:'윈터타워', alias:'카리나', kind:'오피스빌딩', addr:'서울특별시 마포구 독막로 1', bm:'전월', bd:'25일', dm:'당월', dd:'1일', rb:'하나은행', ra:'123-456', rn:'윈터'});
  Object.assign(NB.nb.owners[0], {biz:'214-07-63390', n:'윈터', share:'60'});
  const dup = NB.nbMissing().some(m => /이미 쓰는 별칭/.test(m)), share = NB.nbMissing().some(m => /지분 합계 100%/.test(m));
  NB.nb.alias = '윈터'; NB.nb.owners.push({biz:'105-81-42117', n:'카리나', share:'40'}); NB.nb.dong = [{n:'본관',up:'10',down:'2'},{n:'별관',up:'3',down:''}]; NB.nb.pkUp = '5'; NB.nb.pkDown = '20';
  NB.nbSave(); const b = NB.BUILDINGS.at(-1), h = NB.PRO3(b.id);
  r6.push(['건물 등록 — 필수 빠지면 막힘 · 별칭 중복 · 지분 100% · 저장 → 동 2개 · 주차 25면 · 관리비 계좌 = 임대료 계좌 · 상세 열림(위탁운영계약 없음)',
    blocked && dup && share && NB.BUILDINGS.length === 4 && b.alias === '윈터' && b.dong.length === 2 && b.park === 25
    && b.feeAcct === '하나은행 123-456' && b.owners.length === 2 && /위탁운영계약이 없습니다/.test(h)]); }
/* 계약 상세 주차정보 · 냉난방기 — 배정 주차면은 건물 주차면 기록과 하나 · 냉난방기 구분 없으면 저장 안 됨 */
{ const CP = new Function(stub + bare + '; seedJuly(); return {CTR3,cpkOpen,chvOpen,cx3Save,BUILDINGS,CHVAC,parksOf,CTRS,get cx3(){return cx3;}};')();
  const c = CP.CTRS.find(x => x.no === '본관8층'), b = CP.BUILDINGS.find(x => x.id === 'b1');
  const h = CP.CTR3('b1본관8층'), two = CP.parksOf(c).length === 2;
  CP.cpkOpen('b1본관8층'); const i = b.parks.findIndex(p => p.n === 'B1-04'); CP.cx3.pick[i] = true; CP.cx3Save();
  const moved = b.parks[i].asu === '본관8층' && CP.parksOf(c).length === 3;
  CP.chvOpen('b1본관4층'); CP.cx3Save(); const noT = !CP.CHVAC['b1본관4층']; CP.cx3.t = '건물주 것 사용'; CP.cx3Save();
  r6.push(['계약 상세 — 주차정보에 배정 주차면 2면 · 계약에서 B1-04 배정 → 건물 주차면에도 반영 · 냉난방기 구분 없으면 저장 안 됨',
    two && /주차정보/.test(h) && /냉난방기/.test(h) && /임차인 설치/.test(h) && moved && noT && CP.CHVAC['b1본관4층'].t === '건물주 것 사용']); }
/* 청구일·납부마감일 규칙 — 청구년월 기준 전월·당월·익월 + N일·말일 */
{ const DR = new Function(stub + bare + '; return {dayRule};')().dayRule;
  r6.push(['청구일·납부마감일 — 7월분: 전월 25일 = 6/25 · 당월 1일 = 7/1 · 당월 19일 = 7/19 · 당월 말일 = 7/31 · 익월 10일 = 8/10 · 2월분 당월 말일 = 2/28',
    DR('전월 25일','2026-07') === '2026-06-25' && DR('당월 1일','2026-07') === '2026-07-01' && DR('당월 19일','2026-07') === '2026-07-19'
    && DR('당월 말일','2026-07') === '2026-07-31' && DR('익월 10일','2026-07') === '2026-08-10' && DR('당월 말일','2027-02') === '2027-02-28']); }
/* 건물 운영상태 — 진행중 계약이 있으면 비운영중 못 함 · 사유 필수 · 비운영중이면 청구서 발행 잠김 · 다시 운영중 */
{ const BO = new Function(stub + bare + '; return {bopOpen,bopOK,bOp,PAY1,MORE,get bo(){return bo;},set f1b(v){f1.b=v;}};')();
  BO.bopOpen('b1'); BO.bo.why = '대수선'; BO.bopOK(); const kept = BO.bOp('b1') === '운영중';
  BO.bopOpen('b4'); BO.bopOK(); const noWhy = BO.bOp('b4') === '운영중';
  BO.bo.why = '대수선 공사'; BO.bopOK(); const off = BO.bOp('b4') === '비운영중';
  BO.f1b = 'b4'; BO.MORE.length = 0; const h = BO.PAY1();
  BO.bopOpen('b4'); BO.bo.why = '공사 완료'; BO.bopOK();
  r6.push(['건물 운영상태 — 카리나빌딩(진행중 계약 있음)은 비운영중 불가 · 사유 없으면 안 바뀜 · 카즈하타워 비운영중 → 청구서 발행 잠김 · 다시 운영중',
    kept && noWhy && off && /비운영중인 건물입니다/.test(h) && BO.bOp('b4') === '운영중']); }
/* 일할 계산기 — 양 끝 포함 일수 · 몫을 줄인 뒤 원 미만 버림 · 절사 잔차는 일할하지 않은 계약에 다시 · 줄인 몫은 공실분 · 검증 일치 · 청구서 반영 */
{ const PR = new Function(stub + bare + '; return {prcOpen,prcApply,prcCalc,calc,M,BILL,ISSUE,daysIn,get prc(){return prc;}};')();
  const m = PR.M('elec'), b = PR.BILL.elec, R0 = PR.calc(m), r0 = R0.rows.find(r => r.no === '본관8층');
  PR.prcOpen('elec', '본관8층'); const pd = PR.daysIn(PR.prc.from, PR.prc.to);
  PR.prc.af = '2026-08-01'; PR.prc.at = '2026-08-09'; const got = PR.prcCalc(); PR.prcApply();
  const R1 = PR.calc(m), r1 = R1.rows.find(r => r.no === '본관8층');
  const want = Math.floor(b.supply * r0.ratio * 9 / 31) + Math.floor(b.vat * r0.ratio * 9 / 31);
  const h10 = (() => { const W = new Function(stub + bare + '; BILL.elec.pr = {"본관8층":{af:"2026-08-01",at:"2026-08-09",amt:null}}; BILL.elec.from="2026-07-10"; BILL.elec.to="2026-08-09"; pCode="elec"; return PAY10();')(); return W; })();
  const rk = R1.rows.find(r => r.rnd), line = PR.ISSUE().find(c => c.no === '본관8층').lines.find(l => l.n === '전기요금');
  const ex = Math.floor(25914.55 * 9 / 31) + Math.floor(2591.45 * 9 / 31);
  r6.push(['일할 계산 — 7/10~8/9 = 31일 · 8/1~8/9 = 9일 · 본관8층 공급가액·부가세 몫 × 9 ÷ 31 각각 버림 · 남는 원 단위는 일할이 있어도 부담 비율이 가장 큰 계약에 · 검증 일치 · 청구서 반영 · 예시 28,506원 → 8,275원',
    pd === 31 && got === want && r1.amt === want && (!rk || rk.no === R1.rows.reduce((x, r) => r.ratio > x.ratio ? r : x).no) && R1.diff === 0 && /<td>건물주 부담<\/td>/.test(h10)
    && R1.bill + R1.rows.filter(r => r.st !== '사용중').reduce((x, r) => x + r.amt, 0) + R1.cut === R1.total
    && R1.bill + R1.vac === R1.total && line.amt === want && ex === 8275]);
  PR.prcOpen('elec', '본관7층'); PR.prc.amt = '0'; PR.prc.why = '퇴거 때 추정액으로 받음'; PR.prcApply();
  const R2 = PR.calc(m), r2 = R2.rows.find(r => r.no === '본관7층');
  r6.push(['일할 계산 — 금액을 직접 0원으로 고치면 그대로 · 사유 남음 · 검증 일치', r2.amt === 0 && r2.pro.why === '퇴거 때 추정액으로 받음' && R2.diff === 0]); }
/* 계약 해지 — 해지일 8/20이면 전기요금 08.10~08.20(11일)이 고지 전 · 예상 금액은 추가 청구로 · 사유 없으면 안 됨 */
{ const TM = new Function(stub + bare + '; seedJuly(); return {termOpen,termSave,unbilled,TERMS,ONCE,CTRS,termHTML,get tm(){return tm;}};')();
  const c = TM.CTRS.find(x => x.no === '본관5층');
  TM.termOpen('b1본관5층'); TM.tm.out = '2026-08-20'; TM.termSave(); const noWhy = !TM.TERMS['b1본관5층'];
  const U = TM.unbilled(c, '2026-08-20'), e = U.find(u => u.code === 'elec'), w = U.find(u => u.code === 'water');
  TM.tm.why = '이전'; TM.tm.est.elec = '180000'; const h = TM.termHTML(); TM.termSave();
  const row = TM.ONCE.rows.find(r => r.k === 'b1본관5층');
  r6.push(['계약 해지 — 해지일 8/20: 전기요금 08.10~08.20 11일 고지 전 · 수도요금 08.08~08.20 · 사유 없으면 안 됨 · 예상 180,000원은 「전기요금 퇴거 예상분 (08.10~08.20)」 추가 청구',
    noWhy && e && e.from === '2026-08-10' && e.days === 11 && w && w.from === '2026-08-08' && /아직 고지되지 않은 기간/.test(h)
    && row && row.n === '전기요금 퇴거 예상분 (08.10~08.20)' && row.amt === 180000 && TM.TERMS['b1본관5층'].out === '2026-08-20']); }
/* 유닛 등록 — 필수 빠지면 막힘 · 번호 중복 막힘 · 전용면적 > 임대면적 막힘 · 지하층 · 카드에 생김 */
{ const UN = new Function(stub + bare + '; return {unOpen,unSave,unMissing,unHTML,BUILDINGS,PRO3,get un(){return un;},set tab3(v){tab3=v;}};')();
  const b = UN.BUILDINGS[0], n0 = b.units.length;
  UN.unOpen('b1'); UN.unSave(); const blocked = b.units.length === n0 && UN.unMissing().includes('유닛고유번호');
  Object.assign(UN.un, {no:'본관8층', fl:'8', use:'사무실', area:'330'}); const dup = UN.unMissing().some(x => /이미 있음/.test(x));
  Object.assign(UN.un, {no:'별관B1', dong:'별관', fk:'지하', fl:'1', area:'120', net:'130'}); const big = UN.unMissing().some(x => /임대면적보다/.test(x));
  UN.un.net = '96'; const h = UN.unHTML(); UN.unSave(); const u = b.units.at(-1); UN.tab3 = '유닛'; const t = UN.PRO3('b1');
  r6.push(['유닛 등록 — 필수 빠지면 막힘 · 번호 중복 · 전용면적 > 임대면적 막힘 · 별관 지하 1층 등록 · 전용률 80.0% · 유닛 탭 카드에 생김',
    blocked && dup && big && /80\.0%/.test(h) && b.units.length === n0 + 1 && u.no === '별관B1' && u.fl === -1 && u.st === '공실' && t.includes('별관B1')]); }
/* 유닛 상세 패널 — 계약 있던 유닛은 삭제·번호 변경 막힘 · 새 유닛은 수정 후 사유 넣고 삭제 */
{ const UD = new Function(stub + bare + '; return {udOpen,udEdit,udSave,udDel,udHTML,unOpen,unSave,BUILDINGS,get ud(){return ud;},get un(){return un;}};')();
  const b = UD.BUILDINGS[0];
  UD.udOpen('b1', '본관8층'); const h1 = UD.udHTML(); UD.udEdit(); const h2 = UD.udHTML();
  UD.unOpen('b1'); Object.assign(UD.un, {no:'본관9층', fl:'9', use:'사무실', area:'200'}); UD.unSave();
  UD.udOpen('b1', '본관9층'); UD.udEdit(); UD.ud.f.no = '본관8층'; UD.udSave(); const dup = UD.ud.edit && b.units.some(u => u.no === '본관9층');
  UD.ud.f.no = '본관10층'; UD.ud.f.area = '210'; UD.udSave(); const ed = b.units.find(u => u.no === '본관10층');
  const kept = true; UD.udDel();
  r6.push(['유닛 상세 패널 — 본관8층(계약 있음) 삭제 잠김 · 번호 잠김 · 계약 이력 링크 · 새 유닛 번호 중복 막힘 · 수정 · 사유 없이 삭제',
    /계약이 있었던 유닛은 삭제할 수 없습니다/.test(h1) && /ctr-3\/b1본관8층/.test(h1) && /<th>계약기간<\/th>/.test(h1) && /계약이 있었던 유닛은 바꿀 수 없음/.test(h2)
    && dup && ed && ed.area === 210 && kept && !b.units.some(u => u.no === '본관10층')]); }
/* 계량기 — 유닛 등록 때 체크 · 유닛 상세에서 떼기 · 다시 달기 · 같은 기록(METER) */
{ const MT = new Function(stub + bare + '; return {unOpen,unSave,udOpen,udEdit,udSave,udHTML,unHTML,meterItems,METER,BUILDINGS,get ud(){return ud;},get un(){return un;}};')();
  const b = MT.BUILDINGS[0], its = MT.meterItems(b);
  MT.unOpen('b1'); const h = MT.unHTML(); Object.assign(MT.un, {no:'본관9층', fl:'9', use:'사무실', area:'200'}); MT.un.mt.elec = true; MT.unSave();
  const on1 = MT.METER.elec.includes('본관9층') && !MT.METER.water.includes('본관9층');
  MT.udOpen('b1', '본관6층'); MT.udEdit(); MT.ud.mt.elec = false; MT.udSave(); const off = !MT.METER.elec.includes('본관6층');
  MT.udOpen('b1', '본관6층'); MT.udEdit(); MT.ud.mt.elec = true; MT.udSave(); const back = MT.METER.elec.includes('본관6층');
  r6.push(['계량기 — 계량기 항목은 전기요금·수도요금·가스요금(카리나빌딩은 가스를 청구하지 않아도 표시) · 등록 때 전기만 체크 · 본관6층 계량기 떼기 · 다시 달기',
    its.join() === 'elec,water,gas' && /계량기 있음/.test(h) && on1 && off && back]); }
/* 청구항목 상세 — 관리비 탭 더보기 ⋮(상세·수정) · 전기요금 상세에 계량기 보유 유닛과 최근 3개월 고지서 금액 · 임대료는 약정액 안내 */
{ const CD = new Function(stub + bare + '; return {cdOpen,cdHTML,ciDel,PRO3,MORE,BUILDINGS,BILL,set tab3(v){tab3=v;}};')();
  CD.tab3 = '관리비'; CD.MORE.length = 0; CD.PRO3('b1'); const dd = CD.MORE.some(x => x[0].t === '상세' && x[1].t === '수정');
  CD.cdOpen('elec'); const h = CD.cdHTML(); CD.cdOpen('rent'); const r = CD.cdHTML();
  CD.MORE.length = 0; CD.PRO3('b1'); const dm = CD.MORE.find(x => x[0].go.includes("'임대료'")), dl = dm && dm[2].t === '삭제' && !!dm[2].off;
  CD.ciDel('rent'); const keepRent = CD.BUILDINGS[0].charge.some(c => c.it === '임대료');
  CD.ciDel('septic'); const gone = !CD.BUILDINGS[0].charge.some(c => c.it === '정화조청소비') && CD.BILL.septic.on === false;
  r6.push(['청구항목 상세 — 더보기 ⋮ 상세·수정·삭제(임대료 잠김) · 정화조청소비 삭제 · 전기요금 계량기 보유 유닛 · 최근 고지서 금액 3개월 · 8월 8,491,672원 · 임대료는 약정액 안내',
    dd && dl && keepRent && gone && /계량기 보유 유닛/.test(h) && /최근 고지서 금액/.test(h) && /8,491,672/.test(h) && /약정액/.test(r) && !/최근 고지서 금액/.test(r)]); }
/* 자료보관 — 체크 선택 삭제 · 더보기(상세·다운로드·삭제) · 삭제 사유 필수 */
{ const DC = new Function(stub + bare + '; return {PRO3,dPickRow,dPickAll,docOpen,docHTML,docDelOpen,docDel,BUILDINGS,MORE,get dc(){return dc;},set tab3(v){tab3=v;}};')();
  const b = DC.BUILDINGS[0], n0 = b.docs.length; DC.tab3 = '자료보관';
  DC.MORE.length = 0; const h0 = DC.PRO3('b1'); const dd = DC.MORE.some(x => x.map(i => i.t).join() === '상세,다운로드,삭제');
  DC.docOpen('b1', 0); const hv = DC.docHTML();
  DC.dPickRow(1); DC.dPickRow(2); DC.MORE.length = 0; const h1 = DC.PRO3('b1');
  DC.docDelOpen('b1', [1, 2]); DC.docDel(); const kept = b.docs.length === n0; DC.dc.why = '중복 업로드'; DC.docDel();
  r6.push(['자료보관 — 더보기 상세·다운로드·삭제 · 상세에 귀속 대상·파일·미리보기 · 2건 체크 → 선택 삭제 2건 · 사유 없으면 안 지움 · 지우면 2건 줄어듦',
    dd && /귀속 대상/.test(hv) && /미리보기/.test(hv) && /선택 삭제 2건/.test(h1) && kept && b.docs.length === n0 - 2]); }
/* 수납 내역 더보기 — 받을 돈이 있는 계약(비씨에이전시)만 수납 처리가 눌리고, 다 받은 계약(에스씨케이컴퍼니)은 흐림 · 원장 보기는 모두 */
{ const MV = new Function(stub + bare + '; seedJuly(); return {PAY6,RC,MORE};')();
  MV.RC.f = {b:'b1', ym:'2026-07', st:''}; MV.MORE.length = 0; const h = MV.PAY6();
  const at = no => MV.MORE.find(m => m[0].go === `openPay('b1${no}')`);
  const bc = at('별관3층'), sc = at('본관1층');
  r6.push(['수납 내역 더보기 — ⋮ 드롭다운 · 수납 처리/청구서 보기/원장 보기 · 비씨에이전시 수납 처리 눌림 · 에스씨케이컴퍼니 흐림',
    /moreOpen\(/.test(h) && bc && sc && bc.map(i => i.t).join() === '수납 처리,청구서 보기,원장 보기'
    && !bc[0].off && !!sc[0].off && sc[2].go.includes(`go('ctr-3/b1본관1층')`)]); }
{ const DD = new Function(stub + bare + '; seedJuly(); return {PAY2,f2};')();
  DD.f2.dd = '30'; const h30 = DD.PAY2(); DD.f2.dd = '60'; const h60 = DD.PAY2();
  r6.push(['미납 관리 연체일수 필터 — 30일 이상이면 비씨에이전시(41일)만 · 60일 이상이면 없음', /별관3층/.test(h30) && !/본관B2/.test(h30) && /60일 이상 밀린 계약이 없습니다/.test(h60)]); }
{ const MT = new Function(stub + bare + '; seedJuly(); return {CTR3,set tab3c(v){tab3c=v;}};')();
  MT.tab3c = '청구·수납'; const h = MT.CTR3('b1별관3층'), h2 = MT.CTR3('b1본관1층');
  r6.push(['계약 상세 청구·수납 탭 — 비씨에이전시 6·7월 줄 · 미납 달에 상세 · 합계 미납 5,146,472 · 에스씨케이는 상세 없음',
    /2026년 07월분/.test(h) && /2026년 06월분/.test(h) && (h.match(/openDue\('b1별관3층'/g) || []).length === 2 && /5,146,472원/.test(h) && !/openDue/.test(h2)]); }
const bad6 = r6.filter(x => !x[1]);
if (bad6.length) fail = 1;
console.log('⑥ 수납 기록 ' + (bad6.length ? '✗ ' + bad6.map(x => x[0]).join(' / ') : 'OK — ' + r6.length + '개 검산'));
process.exit(fail);
