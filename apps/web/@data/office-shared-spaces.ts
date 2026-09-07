/**
 * [OFFICE] 페이지 SHARED SPACES
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
    description:
      '입주자와 지역 주민이 함께 사용하는 브리카 라운지. \n커피 한 잔의 여유로 일상 속 균형을 완성합니다.',
    image: '/images/living/shared_space_4960_2196.png',
  },
  {
    id: 2,
    name: '미팅룸',
    description:
      '조용한 회의부터 영상 미팅까지,\n필요할 때 언제든 이용 가능한 예약형 공간입니다.',
    image: '/images/living/shared_space_4960_2196.png',
  },
  {
    id: 3,
    name: '캔틴(탕비실)',
    description:
      '가볍게 머리를 식히거나 식사를 할 수 있는\n따뜻한 휴식 공간입니다.',
    image: '/images/living/shared_space_4960_2196.png',
  },
];
