'use client';

import { Edit, FileText } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';

import type { RequestDetail } from '@/@actions/requests/getRequestDetail';
import type {
  RequestPriority,
  RequestSource,
  RequestStatus,
  RequestType,
} from '@repo/database';

interface RequestStatusSectionProps {
  request: RequestDetail;
}

// 요청 유형 한글 변환
const getRequestTypeLabel = (type: RequestType): string => {
  switch (type) {
    case 'COMPLAINT':
      return '민원';
    case 'SUGGESTION':
      return '제안';
    case 'INQUIRY':
      return '문의';
    case 'REPAIR':
      return '수선';
    default:
      return type;
  }
};

// 요청 출처 한글 변환
const getRequestSourceLabel = (source: RequestSource | null): string => {
  switch (source) {
    case 'TENANT_REQUEST':
      return '입주민';
    case 'TENANT_FACE_TO_FACE':
      return '입주자 대면접수';
    case 'LANDLORD_REQUEST':
      return '건물주 요청';
    case 'LANDLORD_FACE_TO_FACE':
      return '건물주 대면접수';
    case 'INTERNAL':
      return '내부 등록';
    default:
      return source || '미지정';
  }
};

// 처리 상태 한글 변환
const getStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case 'PENDING':
      return '미분류';
    case 'IN_PROGRESS':
      return '처리중';
    case 'COMPLETED':
      return '완료';
    case 'CANCELED':
      return '보류';
    case 'REJECTED':
      return '거부';
    default:
      return status;
  }
};

// 우선순위 한글 변환
const getPriorityLabel = (priority: RequestPriority | null): string => {
  switch (priority) {
    case 'LOW':
      return '낮음';
    case 'MEDIUM':
      return '보통';
    case 'HIGH':
      return '높음';
    default:
      return '미지정';
  }
};

// 날짜 포맷팅
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export function RequestStatusSection({ request }: RequestStatusSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [priority, setPriority] = useState(request.priority);
  const [requestType, setRequestType] = useState(request.requestType);

  const handleSave = () => {
    // TODO: updateRequest action 호출
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {request.title || '제목 없음'}
            </CardTitle>
            <CardDescription>요청 ID: #{request.id.toString()}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="mr-2 h-4 w-4" />
            수정
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-muted-foreground text-sm">
              출처
            </label>
            <p className="text-sm">
              {getRequestSourceLabel(request.requestSource)}
            </p>
          </div>
          <div>
            <label className="font-medium text-muted-foreground text-sm">
              등록일시
            </label>
            <p className="text-sm">{formatDate(request.createdAt)}</p>
          </div>
        </div>

        <div>
          <label className="font-medium text-muted-foreground text-sm">
            유닛 고유 이름
          </label>
          <p className="text-sm">
            {request.Unit?.name || '-'}
            {request.Unit?.unitNumber && ` (${request.Unit.unitNumber})`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-medium text-muted-foreground text-sm">
              처리 상태
            </label>
            {isEditing ? (
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as RequestStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">미분류</SelectItem>
                  <SelectItem value="IN_PROGRESS">처리중</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="CANCELED">보류</SelectItem>
                  <SelectItem value="REJECTED">거부</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline">{getStatusLabel(status)}</Badge>
            )}
          </div>
          <div>
            <label className="font-medium text-muted-foreground text-sm">
              우선순위
            </label>
            {isEditing ? (
              <Select
                value={priority || ''}
                onValueChange={(value) =>
                  setPriority((value as RequestPriority) || null)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">미지정</SelectItem>
                  <SelectItem value="LOW">낮음</SelectItem>
                  <SelectItem value="MEDIUM">보통</SelectItem>
                  <SelectItem value="HIGH">높음</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline">{getPriorityLabel(priority)}</Badge>
            )}
          </div>
          <div>
            <label className="font-medium text-muted-foreground text-sm">
              요청 유형
            </label>
            {isEditing ? (
              <Select
                value={requestType}
                onValueChange={(value) => setRequestType(value as RequestType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLAINT">민원</SelectItem>
                  <SelectItem value="SUGGESTION">제안</SelectItem>
                  <SelectItem value="INQUIRY">문의</SelectItem>
                  <SelectItem value="REPAIR">수선</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline">
                {getRequestTypeLabel(requestType)}
              </Badge>
            )}
          </div>
        </div>

        <div>
          <label className="font-medium text-muted-foreground text-sm">
            요청 상세 내용
          </label>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {request.details || '상세 내용이 없습니다.'}
          </p>
        </div>

        {/* 첨부 파일 섹션 */}
        <div>
          <label className="font-medium text-muted-foreground text-sm">
            첨부 파일
          </label>
          <div className="mt-1 flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">파일명.jpg</span>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
