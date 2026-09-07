'use server';

import { database } from '@repo/database';
import { getUserId } from '../lib/auth';

// const LogActions = {
//   App: {
//     Login: 'AppLogin',
//     Logout: 'AppLogout',
//   },
//   Buildings: {
//     Create: 'BuildingsCreate',
//     Update: 'BuildingsUpdate',
//     Delete: 'BuildingsDelete',
//   },
//   Units: {
//     Create: 'UnitsCreate',
//     Update: 'Update',
//     Delete: 'UnitsDelete',
//   },
//   Users: {
//     Create: 'UsersCreate',
//     Update: 'UsersUpdate',
//     Delete: 'UsersDelete',
//   },
//   Leases: {
//     Create: 'LeasesCreate',
//     Update: 'LeasesUpdate',
//     Delete: 'LeasesDelete',
//   },
//   Bills: {
//     Create: 'BillsCreate',
//     Update: 'BillsUpdate',
//     Delete: 'BillsDelete',
//   },
// };

const LogActions = [
  'AppLogin',
  'AppLogout',
  'BuildingsCreate',
  'BuildingsUpdate',
  'BuildingsDelete',
  'UnitsCreate',
  'UnitsUpdate',
  'UnitsDelete',
  'UsersCreate',
  'UsersUpdate',
  'UsersDelete',
  'LeasesCreate',
  'LeasesUpdate',
  'LeasesDelete',
  'BillsCreate',
  'BillsUpdate',
  'BillsDelete',
] as const;

const descriptionOf = (key: string) => {
  switch (key) {
    case 'AppLogin':
      return '앱 로그인';
    case 'AppLogout':
      return '앱 로그아웃';
    case 'BuildingsCreate':
      return '건물 생성';
    case 'BuildingsUpdate':
      return '건물 수정';
    case 'BuildingsDelete':
      return '건물 삭제';
    case 'UnitsCreate':
      return '유닛 생성';
    case 'UnitsUpdate':
      return '유닛 수정';
    case 'UnitsDelete':
      return '유닛 삭제';
    case 'UsersCreate':
      return '사용자 생성';
    case 'UsersUpdate':
      return '사용자 수정';
    case 'UsersDelete':
      return '사용자 삭제';
    case 'LeasesCreate':
      return '임대 생성';
    case 'LeasesUpdate':
      return '임대 수정';
    case 'LeasesDelete':
      return '임대 삭제';
    case 'BillsCreate':
      return '청구서 생성';
    case 'BillsUpdate':
      return '청구서 수정';
    case 'BillsDelete':
      return '청구서 삭제';
    default:
      return '알 수 없는 작업';
  }
};

export async function addLog(
  action: (typeof LogActions)[number],
  details: any
) {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await database.log.create({
    data: {
      description: descriptionOf(action),
      action,
      details,
      userId: BigInt(userId),
    },
  });
}
