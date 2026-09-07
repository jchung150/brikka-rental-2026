/**
 * [이야기] 페이지 STORIES
 */

export type Story = {
  id: number;
  title: string;
  description: string;
  image: string;
};

export const storyData: Story[] = [
  {
    id: 1,
    title: '브리카 A동 입주민 OOO님',
    description:
      '"입주하면서 가장 만족스러운 건, 관리와 서비스가 세심해 생활이 훨씬 여유로워졌다는 거예요."',
    image: '/images/introduction/swiper_01.png',
  },
  {
    id: 2,
    title: '브리카 B동 입주민 OOO님',
    description:
      '“쾌적한 환경에서 안전하게 거주하고 싶으신분께 추천하고 싶어요.”',
    image: '/images/introduction/swiper_02.png',
  },
  {
    id: 3,
    title: '브리카 C동 입주민 OOO님',
    description:
      '“입주하면서 가장 만족스러운 건, 관리와 서비스가 세심해 생활이 훨씬 여유로워졌다는 거예요.”',
    image: '/images/introduction/swiper_03.png',
  },
  {
    id: 4,
    title: '브리카 D동 입주민 OOO님',
    description:
      '“입주하면서 가장 만족스러운 건, 관리와 서비스가 세심해 생활이 훨씬 여유로워졌다는 거예요.”',
    image: '/images/introduction/swiper_01.png',
  },
];
