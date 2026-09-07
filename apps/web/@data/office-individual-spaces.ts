/**
 * [OFFICE] 페이지 INDIVIDUAL SPACES
 */

export type IndividualSpace = {
  id: number;
  type: string;
  price: number;
  images: string[];
  options: {
    label: string;
    values: string[];
  }[];
};

export const individualSpaces: IndividualSpace[] = [
  {
    id: 1,
    type: '개인 공간',
    price: 80,
    images: [
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
    ],
    options: [
      {
        label: '가구',
        values: ['책상(1400)', '매쉬 의자'],
      },
      {
        label: '시설',
        values: ['냉난방 시스템', '와이파이'],
      },
      {
        label: '기타',
        values: ['커튼'],
      },
    ],
  },
  {
    id: 2,
    type: '2인 오피스',
    price: 80,
    images: [
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
      '/images/office/individual_space_1340x1340.png',
    ],
    options: [
      {
        label: '가구',
        values: ['책상(1400)', '매쉬 의자'],
      },
      {
        label: '시설',
        values: ['냉난방 시스템', '와이파이'],
      },
      {
        label: '기타',
        values: ['커튼'],
      },
    ],
  },
];
