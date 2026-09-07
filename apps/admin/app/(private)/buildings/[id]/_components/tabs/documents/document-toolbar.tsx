import { bulkDownloadDocuments } from '@/@actions/documents/bulkDownloadDocuments';
import type { DocumentListItem } from '@/@actions/documents/listDocuments';
import { documentCategoryLabels, documentTypeLabels } from '@/@data/document';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { Table } from '@tanstack/react-table';
import { Download, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DocumentToolbarProps {
  table: Table<DocumentListItem>;
  onUploadFile: () => void;
  type?: string;
  setType: (type: string) => void;
  category?: string;
  setCategory: (category: string) => void;
}

export function DocumentToolbar({
  table,
  onUploadFile,
  type,
  setType,
  category,
  setCategory,
}: DocumentToolbarProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  const handleBulkDownload = async () => {
    if (!hasSelectedRows) return;

    setIsDownloading(true);
    try {
      const fileIds = selectedRows.map((row) => Number(row.original.fileId));
      const result = await bulkDownloadDocuments(fileIds);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const downloadPromises = result.data.urls.map(
        async ({ fileId, url, fileName }) => {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to download ${fileName}`);

            const blob = await response.blob();
            zip.file(fileName, blob);
          } catch (error) {
            console.error(`Failed to download ${fileName}:`, error);
            toast.error(`${fileName} 다운로드 실패`);
          }
        }
      );

      await Promise.all(downloadPromises);

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `documents-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);

      toast.success(
        `${selectedRows.length}개 파일이 압축되어 다운로드되었습니다.`
      );
    } catch (error) {
      console.error('Bulk download error:', error);
      toast.error('다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Select value={category} onValueChange={(value) => setCategory(value)}>
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="건물 공용" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(documentCategoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(value) => setType(value)}>
          <SelectTrigger className="h-8 w-[200px]">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(documentTypeLabels).map(([value, labels]) => (
              <SelectGroup key={value}>
                <SelectLabel>{value}</SelectLabel>
                {labels.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={!hasSelectedRows || isDownloading}
          onClick={handleBulkDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading
            ? '다운로드 중...'
            : `다운로드 (${selectedRows.length})`}
        </Button>
        <Button
          size="sm"
          className="h-8"
          onClick={onUploadFile}
          variant={'outline'}
        >
          <Upload className="mr-2 h-4 w-4" />
          파일 업로드
        </Button>
      </div>
    </div>
  );
}
