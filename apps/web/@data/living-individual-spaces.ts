/**
 * [LIVING] 페이지 INDIVIDUAL SPACES
 */
export type TermItem = {
  title: string;
  className: string;
  options: {
    label: string;
    values: string[];
  }[];
};

export type IndividualSpace = {
  id: number;
  type: string;
  monthlyRent: number;
  title: string;
  description: string;
  images: string[];
  options: {
    label: string;
    values: string[];
  }[];
  deposit: number;
  faqs: {
    question: string;
    answer: string;
  }[];
};

export const termItems: TermItem[] = [
  {
    title: '장기 거주 세대',
    className: 'bg-[#FEF2EC]',
    options: [
      {
        label: '가구',
        values: ['옷장, 수납장'],
      },
      {
        label: '가전',
        values: ['시스템 에어컨, 건조겸용 세탁기, 냉장고, 인덕션, 전자레인지'],
      },
      {
        label: '기타',
        values: ['매트리스', '커튼'],
      },
    ],
  },
  {
    title: '단기 숙박 세대',
    className: 'bg-[#F6F2F0]',
    options: [
      {
        label: '가구',
        values: ['옷장, 수납장'],
      },
      {
        label: '가전',
        values: ['시스템 에어컨, 건조겸용 세탁기, 냉장고, 인덕션, 전자레인지'],
      },
      {
        label: '기타',
        values: ['매트리스', '커튼'],
      },
    ],
  },
];

const commonFaqs = [
  {
    question: '계약 기간을 1년 이하로 하고 싶어요.',
    answer:
      '죄송합니다. 이촌 브리카 이촌은 기본 계약 기간은 1년입니다. 단기 거주가 가능한 공간을 준비하고 있으니 기다려주세요.',
  },
  {
    question: '전입 신고가 가능한가요?',
    answer: '답변 준비중',
  },
  {
    question: '보증금과 월 임차료 외에 추가로 발생하는 비용이 있나요?',
    answer: '답변 준비중',
  },
  {
    question: '고장, 불편 사항이 발생하면 어떻게 문의하나요?',
    answer: '답변 준비중',
  },
  {
    question: '계약자와 입주자 달라도 되나요?',
    answer: '답변 준비중',
  },
];

export const individualSpaces: IndividualSpace[] = [
  {
    id: 1,
    type: 'Open',
    monthlyRent: 150,
    title: '가장 기본적인 개방형 구조',
    description:
      '거실과 키친이 하나로 이어진 구조로, 공간의 흐름이 자연스럽습니다. 작은 면적에서도 넓고 시원한 개방감을 느낄 수 있는 타입입니다.',
    images: [
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
    ],
    options: [
      {
        label: '면적',
        values: ['29.07m²', '34.63m²', '35.27m²'],
      },
      {
        label: '전입신고',
        values: ['가능'],
      },
      {
        label: '주차',
        values: ['가능(유료)'],
      },
      {
        label: '가구',
        values: ['옷장', '수납장', '신발장', '커튼'],
      },
      {
        label: '시설',
        values: [
          '에어컨',
          '바닥난방',
          '세탁기(건조기겸용)',
          '냉장고',
          '인덕션',
          '전자레인지',
        ],
      },
    ],
    deposit: 1500,
    faqs: commonFaqs,
  },
  {
    id: 2,
    type: 'Balance',
    monthlyRent: 140,
    title: '분리형 구조로 생활의 안정감',
    description:
      '거실과 키친이 분리된 구조로, 생활의 리듬이 안정적으로 구분됩니다. 일과 휴식의 경계를 자연스럽게 유지할 수 있는 타입입니다.',
    images: [
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
    ],
    options: [
      {
        label: '면적',
        values: ['29.07m²', '34.63m²', '35.27m²'],
      },
      {
        label: '전입신고',
        values: ['가능'],
      },
      {
        label: '주차',
        values: ['가능(유료)'],
      },
      {
        label: '가구',
        values: ['옷장', '수납장', '신발장', '커튼'],
      },
      {
        label: '시설',
        values: [
          '에어컨',
          '바닥난방',
          '세탁기(건조기겸용)',
          '냉장고',
          '인덕션',
          '전자레인지',
        ],
      },
    ],
    deposit: 1500,
    faqs: commonFaqs,
  },
  {
    id: 3,
    type: 'Wide',
    monthlyRent: 150,
    title: '가로가 긴 형태로 채광, 환기 중심',
    description:
      '가로로 긴 형태의 평면으로, 창면이 넓어 채광과 환기가 뛰어납니다. 개방감과 여유를 함께 느낄 수 있는 구조입니다.',
    images: [
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
    ],
    options: [
      {
        label: '면적',
        values: ['29.07m²', '34.63m²', '35.27m²'],
      },
      {
        label: '전입신고',
        values: ['가능'],
      },
      {
        label: '주차',
        values: ['가능(유료)'],
      },
      {
        label: '가구',
        values: ['옷장', '수납장', '신발장', '커튼'],
      },
      {
        label: '시설',
        values: [
          '에어컨',
          '바닥난방',
          '세탁기(건조기겸용)',
          '냉장고',
          '인덕션',
          '전자레인지',
        ],
      },
    ],
    deposit: 1500,
    faqs: commonFaqs,
  },
  {
    id: 4,
    type: 'Studio',
    monthlyRent: 120,
    title: '모든 기능이 한 공간에 담긴 완결형',
    description:
      '거실, 키친, 그리고 방이 하나로 이어진 구조로, 가장 단정하고 효율적인 생활 공간입니다.',
    images: [
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
      '/images/living/individual_space_1384_1600.png',
    ],
    options: [
      {
        label: '면적',
        values: ['29.07m²', '34.63m²', '35.27m²'],
      },
      {
        label: '전입신고',
        values: ['가능'],
      },
      {
        label: '주차',
        values: ['가능(유료)'],
      },
      {
        label: '가구',
        values: ['옷장', '수납장', '신발장', '커튼'],
      },
      {
        label: '시설',
        values: [
          '에어컨',
          '바닥난방',
          '세탁기(건조기겸용)',
          '냉장고',
          '인덕션',
          '전자레인지',
        ],
      },
    ],
    deposit: 1500,
    faqs: commonFaqs,
  },
];
