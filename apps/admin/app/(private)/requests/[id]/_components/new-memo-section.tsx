'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Textarea } from '@repo/design-system/components/ui/textarea';

import { createRequestMessage } from '@/@actions/requests/messages';

interface NewMemoSectionProps {
  requestId: number;
}

export function NewMemoSection({ requestId }: NewMemoSectionProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createRequestMessage({
        requestId,
        content: content.trim(),
      });

      if (result.ok) {
        setContent('');
        // TODO: 메시지 목록 새로고침
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to create message:', error);
      alert('메시지 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>신규 메모 작성</CardTitle>
        <CardDescription>
          요청에 대한 새로운 메모나 응답을 작성하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="메모 내용을 입력하세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? '등록 중...' : '메모 등록'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
