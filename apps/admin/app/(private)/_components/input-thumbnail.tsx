'use client';

import { uploadFile } from '@/lib/utils';
import { cn } from '@repo/design-system/lib/utils';
import { Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface InputThumbnailProps {
  value?: string;
  onUpload?: (file: { id: number; fileUrl: string }) => void;
  onError?: (error: string) => void;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export function InputThumbnail({
  value,
  onUpload,
  onError,
  onRemove,
  className,
  disabled = false,
}: InputThumbnailProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (disabled || isUploading) return;

      // 이미지 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        onError?.('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setIsUploading(true);

      try {
        const result = await uploadFile(file);
        if (result) {
          onUpload?.(result);
        } else {
          onError?.('이미지 업로드에 실패했습니다.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        onError?.('이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, isUploading, onUpload, onError]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (disabled || isUploading) return;

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [disabled, isUploading, handleFileUpload]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (!disabled && !isUploading) {
        setIsDragOver(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleRemove = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!disabled && !isUploading) {
        onRemove?.();
      }
    },
    [disabled, isUploading, onRemove]
  );

  return (
    <div className={cn('flex-shrink-0', className)}>
      <div
        // biome-ignore lint/a11y/useSemanticElements: <explanation>
        role="button"
        className={cn(
          'relative h-32 w-48 cursor-pointer rounded-lg border-2 border-dashed transition-colors',
          isDragOver && 'border-blue-400 bg-blue-50',
          disabled && 'cursor-not-allowed opacity-50',
          isUploading && 'cursor-wait',
          !value && 'border-gray-300 hover:border-gray-400',
          value && 'border-gray-200'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        tabIndex={disabled || isUploading ? -1 : 0}
        onKeyDown={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {value ? (
          <div className="relative h-full w-full">
            <img
              src={value}
              alt="업로드된 이미지"
              className="h-full w-full rounded-lg object-cover"
            />
            {!disabled && !isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            {isUploading ? (
              <>
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                <span className="text-gray-500 text-sm">업로드 중...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-gray-400" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-gray-500 text-xs">
                    {isDragOver ? '여기에 놓으세요' : '클릭하거나 드래그하세요'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* 딤 처리 */}
        {isUploading && (
          <div className="absolute inset-0 rounded-lg bg-black/20" />
        )}
      </div>
    </div>
  );
}
