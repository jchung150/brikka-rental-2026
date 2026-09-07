export type LivingFaqCategory = 'contract' | 'usage' | 'info' | 'payment';
export type LiviingFaqTab = 'all' | LivingFaqCategory;

export type LivingFaq = {
  question: string;
  answer: string;
  category: LivingFaqCategory;
};

export const livingFaqTabs: {
  label: string;
  value: LiviingFaqTab;
}[] = [
  {
    label: '전체',
    value: 'all',
  },
  {
    label: '입주/계약',
    value: 'contract',
  },
  {
    label: '시설/공간 이용',
    value: 'usage',
  },
  {
    label: '입주자 혜택/생활 정보',
    value: 'info',
  },
  {
    label: '결제',
    value: 'payment',
  },
];

export const livingFaqs: LivingFaq[] = [
  {
    question: '주차가 가능한가요?',
    answer:
      '네, 유료로 이용하실 수 있습니다. 여유 주차면이 제한되어 있으니, 계약 전 미리 확인해 주세요.',
    category: 'usage',
  },
  {
    question: '반려 동물과 함께 입주할 수 있나요?',
    answer:
      '죄송하지만 브리카 이촌은 반려동물 입주가 어렵습니다.\n반려동물과 함께 지낼 수 있는 새로운 공간을 준비 중이니, 곧 좋은 소식으로 찾아뵙겠습니다.',
    category: 'usage',
  },
  {
    question: '가구와 가전이 포함되어 있나요?',
    answer:
      '브리카 이촌의 모든 유닛은 풀옵션으로 제공됩니다. 다만, 침대와 소파 등 개인 가구는 제공되지 않습니다. 아래 내용을 참고해 주세요.\n가구: 옷장, 수납장\n가전: 시스템 에어컨, 건조겸용 세탁기, 냉장고, 인덕션, 전자레인지\n기타: 커튼',
    category: 'usage',
  },
  {
    question: '계약 절차가 어떻게 되나요?',
    answer:
      '입주 신청 후 승인이 완료되면, 세대별 전용 가상계좌가 발급됩니다.\n전자서명으로 계약서를 작성하고 계약금을 입금하시면 모든 절차가 완료됩니다.',
    category: 'contract',
  },
  {
    question: '보증금은 얼마인가요? 조정이 가능한가요?',
    answer: '보증금은 월 임차료의 10개월치로 고정되어 있습니다.',
    category: 'payment',
  },
  {
    question: '임대료 납부는 어떻게 하나요?',
    answer:
      '브리카 전용 온라인 임대관리시스템(홈페이지 상단 ‘입주자 포털’ 로그인)을 통해 임대료 납부, 내역 확인, 수선 요청 등을 간편하게 처리하실 수 있습니다.',
    category: 'payment',
  },
  {
    question: '관리비에는 어떤 항목이 포함되나요?',
    answer:
      '브리카 이촌의 관리비는 세대별 관리비와 공용 관리비로 구분됩니다.\n세대별 관리비는 각 입주자가 직접 납부하며, 공용 관리비는 면적 비율에 따라 부과됩니다.\n공용 관리비의 항목으로는 청소, 보안, 공용 전기 및 수도, 공용 공간 유지비 등이 있습니다.',
    category: 'payment',
  },
  {
    question: '전입신고가 가능한가요?',
    answer:
      '네, 가능합니다. 브리카 이촌은 전입신고가 가능한 주거형 레지던스입니다.',
    category: 'contract',
  },
  {
    question: '계약을 중도 해지 할 수 있나요?',
    answer:
      '네, 가능합니다. 다만 계약 기간 중 해지 시 위약금이 발생할 수 있으며,\n계약 시 적용받은 할인 금액이 있다면 함께 정산됩니다.',
    category: 'contract',
  },
  {
    question: '브리카 이촌에 단기 숙박 세대는 없나요?',
    answer:
      '현재는 장기 거주 세대만 운영 중입니다.\n앞으로 새롭게 오픈할 지점에서는 단기 숙박형 유닛도 함께 선보일 예정입니다.',
    category: 'usage',
  },
  {
    question: '프라이빗 오피스가 뭔가요? 입주자가 신청하면 혜택이 있나요?',
    answer:
      '프라이빗 오피스는 소규모 사무 공간으로, 입주자뿐 아니라 외부 이용자도 신청 가능합니다.\n입주자분께는 별도의 할인 혜택이 제공됩니다.',
    category: 'info',
  },
];
