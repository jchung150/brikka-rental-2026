'use client';

import type { DocumentListItem } from '@/@actions/documents/listDocuments';
import { PagingTable } from '@/components/data-table/paging-table';
import { Button } from '@repo/design-system/components/ui/button';
import {} from '@repo/design-system/components/ui/dropdown-menu';
import type { SortingState, Table as TableType } from '@tanstack/react-table';
import { Download, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeleteDocumentDialog } from './delete-document-dialog';
import { columns } from './documents-column';
import { EditDocumentDialog } from './edit-document-dialog';

interface DocumentsTableProps {
  documents: DocumentListItem[];
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  page: number;
  setPage: (page: number) => void;
  lastPage: number;
  handleUpload: () => void;
}

// 선택된 문서 다운로드 툴바 컴포넌트
function DocumentsToolbar({
  table,
  handleUpload,
}: {
  table: TableType<DocumentListItem>;
  handleUpload: () => void;
}) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  const handleDownload = async () => {
    if (!hasSelectedRows) return;
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 text-sm">
        {selectedRows.length}개 문서 선택됨
      </span>
      <div className="flex items-center space-x-2">
        <Button onClick={handleDownload} size="sm" variant={'outline'}>
          <Download className="mr-2 h-4 w-4" />
          선택한 문서 다운로드
        </Button>
        <Button onClick={handleUpload} size="sm" variant={'outline'}>
          <Upload className="mr-2 h-4 w-4" />
          파일 업로드
        </Button>
      </div>
    </div>
  );
}

export function DocumentsTable({
  documents,
  sorting,
  setSorting,
  page,
  setPage,
  handleUpload,
  lastPage,
}: DocumentsTableProps) {
  const [editingDocument, setEditingDocument] =
    useState<DocumentListItem | null>(null);
  const [deletingDocument, setDeletingDocument] =
    useState<DocumentListItem | null>(null);

  const handleEdit = (document: DocumentListItem) => {
    setEditingDocument(document);
  };

  const handleDelete = (document: DocumentListItem) => {
    setDeletingDocument(document);
  };

  const handleDownload = (document: DocumentListItem) => {
    // 실제로는 파일 다운로드 로직 구현
    console.log('다운로드:', document.title);
  };

  const handleUpdate = (updatedDocument: DocumentListItem) => {
    setEditingDocument(null);
  };

  const handleConfirmDelete = () => {
    if (deletingDocument) {
      setDeletingDocument(null);
    }
  };

  // 컬럼 정의

  const ToolbarComponent = useMemo(() => {
    return function Toolbar({ table }: { table: TableType<DocumentListItem> }) {
      return <DocumentsToolbar table={table} handleUpload={handleUpload} />;
    };
  }, [handleUpload]);

  return (
    <>
      <PagingTable
        columns={columns}
        data={documents}
        Toolbar={ToolbarComponent}
        sorting={sorting}
        setSorting={(sorting) => setSorting(sorting as SortingState)}
        page={page}
        setPage={setPage}
        lastPage={lastPage}
      />

      <EditDocumentDialog
        open={!!editingDocument}
        onOpenChange={(open) => !open && setEditingDocument(null)}
        document={editingDocument}
        onUpdate={handleUpdate}
      />

      <DeleteDocumentDialog
        open={!!deletingDocument}
        onOpenChange={(open) => !open && setDeletingDocument(null)}
        document={deletingDocument}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
