/**
 * [공간] 페이지 UNIT
 */

export type Unit = {
  id: number;
  name: string;
  deposit: number;
  rent: number;
  maintenanceFee: number;
  description: string;
  image: string;
  vacant: boolean;
};

export const unitData: Unit[] = [
  {
    id: 1,
    name: 'Unit 1',
    deposit: 1000,
    rent: 100,
    maintenanceFee: 10,
    image: '/images/introduction/swiper_01.png',
    description:
      '주방과 다이닝 공간이 확장된 구조로, 가족 또는 2인 생활에 최적화된 편리한 동선을 자랑합니다.',
    vacant: false,
  },
  {
    id: 2,
    name: 'Unit 2',
    deposit: 2000,
    rent: 200,
    maintenanceFee: 20,
    image: '/images/introduction/swiper_02.png',
    description:
      '주방과 다이닝 공간이 확장된 구조로, 가족 또는 2인 생활에 최적화된 편리한 동선을 자랑합니다.',
    vacant: true,
  },
  {
    id: 3,
    name: 'Unit 3',
    deposit: 3000,
    rent: 300,
    maintenanceFee: 30,
    image: '/images/introduction/swiper_03.png',
    description:
      '주방과 다이닝 공간이 확장된 구조로, 가족 또는 2인 생활에 최적화된 편리한 동선을 자랑합니다.',
    vacant: true,
  },
  {
    id: 4,
    name: 'Unit 4',
    deposit: 4000,
    rent: 400,
    maintenanceFee: 40,
    image: '/images/introduction/swiper_01.png',
    description:
      '주방과 다이닝 공간이 확장된 구조로, 가족 또는 2인 생활에 최적화된 편리한 동선을 자랑합니다.',
    vacant: true,
  },
  {
    id: 5,
    name: 'Unit 5',
    deposit: 5000,
    rent: 500,
    maintenanceFee: 50,
    image: '/images/introduction/swiper_02.png',
    description:
      '주방과 다이닝 공간이 확장된 구조로, 가족 또는 2인 생활에 최적화된 편리한 동선을 자랑합니다.',
    vacant: true,
  },
];
