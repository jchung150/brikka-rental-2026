const DOC_TYPE_BUILDING = [
  '위탁 운영 계약서',
  '건물 등기부등본',
  '건물 도면',
  '정기 시설 점검 기록',
  '공용 시설 수리 내역',
  '커뮤니케이션 기록',
  '보고서 및 분석자료',
  '기타',
] as const;

const PARKING_SPACE_TYPE = {
  NORMAL: '일반',
  COMPACT: '소형',
  HANDICAPPED: '장애인',
} as const;

const DOC_TYPE_UNIT = [
  '계약서',
  '신분증 및 인증 서류',
  '보증금 및 입출금 내역',
  '청구 및 납부 관련 문서',
  '요청 및 수리 이력',
  '유닛 내 시설 정보',
  '커뮤니케이션 기록',
  '기타',
] as const;
export const C = {
  PARKING_SPACE_TYPE: PARKING_SPACE_TYPE,
  BILLING_ITEMS: [
    '임대료',
    '주차비',
    '청소비',
    '경비비',
    '소독비',
    '승강기유지비',
    '홈네트워크설비유지비',
    '수선비',
    '시설유지비',
    '안전점검비',
    '재해예방비',
  ] as const,
  BILLING_CYCLES: [
    '이번만',
    '매일',
    '매주',
    '매월',
    '2개월마다',
    '분기마다',
  ] as const,
  DOC_TYPE_BUILDING: DOC_TYPE_BUILDING,
  DOC_TYPE_UNIT: DOC_TYPE_UNIT,
  ALL_DOC_TYPES: [...DOC_TYPE_BUILDING, ...DOC_TYPE_UNIT] as const,
};
