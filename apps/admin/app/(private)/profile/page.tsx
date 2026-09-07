import { getUserProfile } from '@/@actions/users/getUserProfile';
import { ProfilePageClient } from './components/profile-page-client';

export default async function ProfilePage() {
  const result = await getUserProfile();

  if (!result.ok) {
    return <div>프로필 정보를 불러올 수 없습니다: {result.message}</div>;
  }

  const user = result.data;

  return <ProfilePageClient user={user} />;
}
