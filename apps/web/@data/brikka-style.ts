/**
 * [홈] 페이지 BRIKKA STYLE 섹션
 */

export type BrikkaStyle = {
  id: number;
  image: string;
  title: string;
  description: string;
};

export const brikkaStyles: BrikkaStyle[] = [
  {
    id: 1,
    image: '/images/home/style_01.png',
    title: '좋은 자재로 완성한 개인 공간',
    description:
      '보이지 않는 부분까지 정성스럽게 시공했습니다.\n모든 호실에는 테라스가 있으며,\n이건 시스템 창호와 온돌 강마루를 적용해\n사계절 내내 따뜻하고 쾌적한 온도를 유지합니다.',
  },
  {
    id: 2,
    image: '/images/home/style_01.png',
    title: '햇살과 바람이 머무는 창과 테라스',
    description:
      '넓은 창을 통해 자연의 리듬이 실내로 스며듭니다.\n아침의 빛, 저녁의 바람 —\n언제든 내 공간 안에서 계절을 느낄 수 있습니다.',
  },
  {
    id: 3,
    image: '/images/home/style_01.png',
    title: '균형을 만드는 공용 공간',
    description:
      '집과 일, 쉼과 움직임 사이의 균형을 위한 곳.\n카페 라운지, 요가룸, 러닝룸, 루프탑, 프라이빗 오피스 —\n브리카의 공용 공간은 그 모든 조화를 담고 있습니다.',
  },
];
