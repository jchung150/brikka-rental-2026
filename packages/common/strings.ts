import {
  ApplianceFurnitureCategory,
  BillStatus,
  LeaseStatus,
  NotificationChannel,
  ParkingSpaceType,
  RecurrencePeriod,
  RecurrenceType,
  RequestPriority,
  RequestSource,
  RequestStatus,
  RequestType,
  UnitStatus,
  UsageScope,
  UserPermissionType,
  UserRole,
} from '@repo/database/generated/client';

/**
 * 문자열 상수 및 유틸리티 모음
 */
export const Strings = {
  /**
   * UserRole 관련 문자열 및 유틸리티
   */
  userRole: {
    [UserRole.ADMIN]: '슈퍼관리자',
    [UserRole.MANAGER]: '관리자',
    [UserRole.TENANT]: '입주자',
    [UserRole.LANDLORD]: '임대인',
  } as const,

  requestPriority: {
    [RequestPriority.LOW]: '낮음',
    [RequestPriority.MEDIUM]: '중간',
    [RequestPriority.HIGH]: '높음',
  } as const,

  requestSource: {
    [RequestSource.TENANT_REQUEST]: '입주자요청',
    [RequestSource.TENANT_FACE_TO_FACE]: '입주자 대면요청',
    [RequestSource.LANDLORD_REQUEST]: '임대인 요청',
    [RequestSource.LANDLORD_FACE_TO_FACE]: '임대인 대면요청',
    [RequestSource.INTERNAL]: '내부등록',
  } satisfies Record<RequestSource, string>,

  requestStatus: {
    [RequestStatus.PENDING]: '미분류',
    [RequestStatus.IN_PROGRESS]: '처리중',
    [RequestStatus.COMPLETED]: '완료',
    [RequestStatus.CANCELED]: '보류',
    [RequestStatus.REJECTED]: '거부',
  } as const,

  requestType: {
    [RequestType.REPAIR]: '수선',
    [RequestType.COMPLAINT]: '민원',
    [RequestType.INQUIRY]: '문의',
    [RequestType.SUGGESTION]: '제안',
  } as const,

  /**
   * UserPermissionType 관련 문자열
   */
  userPermissionType: {
    [UserPermissionType.MANAGER_GENERAL]: '일반 관리권한',
    [UserPermissionType.MANAGER_FACILITY]: '시설 관리권한',
    [UserPermissionType.USER_MANAGEMENT]: '사용자 관리권한',
    [UserPermissionType.BUILDING_MANAGEMENT]: '건물 관리권한',
    [UserPermissionType.LEASE_MANAGEMENT]: '임대차 관리권한',
    [UserPermissionType.BILLING_MANAGEMENT]: '청구 관리권한',
    [UserPermissionType.REPORT_VIEW]: '리포트 조회권한',
    [UserPermissionType.SYSTEM_SETTINGS]: '시스템 설정권한',
  } as const,

  /**
   * UnitStatus 관련 문자열
   */
  unitStatus: {
    [UnitStatus.VACANT]: '공실',
    [UnitStatus.OCCUPIED]: '입주중',
    [UnitStatus.RESERVED]: '예약중',
    [UnitStatus.UNDER_CONSTRUCTION]: '공사중',
  } as const,

  /**
   * LeaseStatus 관련 문자열
   */
  leaseStatus: {
    [LeaseStatus.PREPARING]: '계약중',
    [LeaseStatus.COMPLETED]: '계약종료',
    [LeaseStatus.ACTIVE]: '계약완료',
    [LeaseStatus.TERMINATED]: '계약해지',
  } as const,

  /**
   * RecurrenceType 관련 문자열
   */
  recurrenceType: {
    [RecurrenceType.RECURRING]: '반복',
    [RecurrenceType.ONE_TIME]: '일회',
  } as const,

  /**
   * RecurrencePeriod 관련 문자열
   */
  recurrencePeriod: {
    [RecurrencePeriod.MONTHLY]: '월별',
    [RecurrencePeriod.QUARTERLY]: '분기별',
    [RecurrencePeriod.YEARLY]: '연간',
  } as const,

  /**
   * NotificationChannel 관련 문자열
   */
  notificationChannel: {
    [NotificationChannel.ALIMTALK]: '알림톡',
    [NotificationChannel.EMAIL]: '이메일',
    [NotificationChannel.SMS]: 'SMS',
  } as const,

  /**
   * BillStatus 관련 문자열
   */
  billStatus: {
    [BillStatus.PAID]: '납부완료',
    [BillStatus.UNPAID]: '미납',
    [BillStatus.OVERDUE]: '연체',
  } as const,

  /**
   * ParkingSpaceType 관련 문자열
   */
  parkingSpaceType: {
    [ParkingSpaceType.NORMAL]: '일반',
    [ParkingSpaceType.COMPACT]: '소형',
    [ParkingSpaceType.HANDICAPPED]: '장애인',
  } as const,

  /**
   * ApplianceFurnitureCategory 관련 문자열
   */
  applianceFurnitureCategory: {
    [ApplianceFurnitureCategory.APPLIANCE]: '가전제품',
    [ApplianceFurnitureCategory.FURNITURE]: '가구',
  } as const,

  /**
   * UsageScope 관련 문자열
   */
  usageScope: {
    [UsageScope.BUILDING_COMMON]: '건물 공용',
    [UsageScope.UNIT_COMMON]: '유닛 공용',
    [UsageScope.UNIT_EXCLUSIVE]: '유닛 전용',
  } as const,
  contactType: {
    residential: '주거',
    office: '오피스',
  } as const,
};
