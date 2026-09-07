'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

type Header<T = any> = {
  id: keyof T;
  label: string;
};

export function ExcelDownload<T extends Record<string, any>>({
  downloadFn,
  headers,
  filename = 'data',
}: {
  downloadFn: () => Promise<T[]>;
  headers: Header<T>[];
  filename?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const rawData = await downloadFn();

      // headers 기준으로 데이터 변환
      const excelData = rawData.map((row) => {
        const transformedRow: Record<string, any> = {};
        for (const header of headers) {
          // rawData의 각 행에서 header.id에 해당하는 값을 찾아서 변환
          const value = row[header.id];
          transformedRow[header.label] =
            value !== null && value !== undefined ? String(value) : '';
        }
        return transformedRow;
      });

      // 워크시트 생성 (헤더는 자동으로 첫 번째 행에 들어감)
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // 파일 다운로드
      const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Excel 다운로드 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download />
      )}
      다운로드
    </Button>
  );
}
