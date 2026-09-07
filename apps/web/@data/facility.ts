/**
 * [소개] 페이지 FACILITIES
 */

export type FacilityType = 'common' | 'resident' | 'rooftop';

export const facilities: { id: number; image: string; type: FacilityType }[] = [
  {
    id: 1,
    image: '/images/introduction/swiper_01.png',
    type: 'common',
  },
  {
    id: 2,
    image: '/images/introduction/swiper_02.png',
    type: 'resident',
  },
  {
    id: 3,
    image: '/images/introduction/swiper_03.png',
    type: 'rooftop',
  },
  {
    id: 4,
    image: '/images/home/style_01.png',
    type: 'common',
  },
  {
    id: 5,
    image: '/images/home/style_02.png',
    type: 'resident',
  },
  {
    id: 6,
    image: '/images/home/style_03.png',
    type: 'rooftop',
  },
  {
    id: 7,
    image: '/images/home/style_04.png',
    type: 'rooftop',
  },
];
