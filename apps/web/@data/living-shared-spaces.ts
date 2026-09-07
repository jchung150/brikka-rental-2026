/**
 * [LIVING] 페이지 SHARED SPACES
 */

export type SharedSpace = {
  id: number;
  name: string;
  description: string;
  image: string;
};

export const sharedSpaces: SharedSpace[] = [
  {
    id: 1,
    name: '카페 브리카 (카페겸 라운지)',
    description: '입주자와 지역 주민 모두 이용할 수 있는 카페겸 라운지',
    image: '/images/living/shared_space_4960_2196.png',
  },
  {
    id: 2,
    name: '프라이빗 오피스',
    description: '24시간 이용 가능한 월결제용 1-3인 전용 오피스',
    image: '/images/living/shared_space_4960_2196.png',
  },
  {
    id: 3,
    name: '플렉스룸1',
    description: '1인 전용 예약형 유산소룸',
    image: '/images/living/shared_space_4960_2196.png',
  },
  {
    id: 4,
    name: '플렉스룸2',
    description: '1인 전용 예약형 요가룸',
    image: '/images/living/shared_space_4960_2196.png',
  },
  {
    id: 5,
    name: '루프탑',
    description: '도심의 풍경을 감상할 수 있는 루프탑',
    image: '/images/living/shared_space_4960_2196.png',
  },
];
