'use client';

import { Edit, Reply, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Textarea } from '@repo/design-system/components/ui/textarea';

import { listRequestMessages } from '@/@actions/requests/messages';
import type { RequestMessage } from '@/@actions/requests/messages';

interface ResponseHistorySectionProps {
  requestId: number;
}

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

export function ResponseHistorySection({
  requestId,
}: ResponseHistorySectionProps) {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadMessages();
  }, [requestId]);

  const loadMessages = async () => {
    try {
      const result = await listRequestMessages(requestId);
      if (result.ok) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (message: RequestMessage) => {
    setEditingId(Number(message.id));
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    // TODO: updateRequestMessage action 호출
    setEditingId(null);
    setEditContent('');
    loadMessages();
  };

  const handleDelete = async (messageId: number) => {
    if (!confirm('정말로 이 메시지를 삭제하시겠습니까?')) return;

    // TODO: deleteRequestMessage action 호출
    loadMessages();
  };

  const handleReply = async () => {
    if (!replyingTo || !replyContent.trim()) return;

    // TODO: createRequestMessage action 호출
    setReplyingTo(null);
    setReplyContent('');
    loadMessages();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>응답 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <p>로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>응답 내역</CardTitle>
        <CardDescription>
          요청에 대한 응답 및 메모를 확인하고 관리하세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            아직 응답이 없습니다.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id.toString()}
              className="space-y-2 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {message.User?.name || '알 수 없음'}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(Number(message.id))}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(message)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(Number(message.id))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {editingId === Number(message.id) ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      취소
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              )}

              {/* 답글 작성 */}
              {replyingTo === Number(message.id) && (
                <div className="ml-4 space-y-2 border-muted border-l-2 pl-4">
                  <Textarea
                    placeholder="답글을 입력하세요..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      취소
                    </Button>
                    <Button size="sm" onClick={handleReply}>
                      답글 등록
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
