'use client';

import {
  type DocumentListItem,
  listDocuments,
} from '@/@actions/documents/listDocuments';
import { QueryKeys } from '@/@hooks/query-keys';
import { PagingTable } from '@/components/data-table/paging-table';
import { CardSkeleton } from '@repo/design-system/components/skeleton';
import { useQuery } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { createDocumentColumns } from './document-columns';
import { DocumentDialogs } from './document-dialogs';
import { DocumentToolbar } from './document-toolbar';

interface DocumentsTabProps {
  buildingId: number;
}

export function DocumentsTab({ buildingId }: DocumentsTabProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<DocumentListItem | null>(null);
  const [deletingDocument, setDeletingDocument] =
    useState<DocumentListItem | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true },
  ]);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('all');
  const [type, setType] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: QueryKeys.Document.List({
      wh: { buildingId },
      page,
      category,
      type,
    }),
    queryFn: () => listDocuments({ wh: { buildingId }, page, category, type }),
  });

  const columns = useMemo(() => {
    return createDocumentColumns(
      (document) => setEditingDocument(document),
      (document) => setDeletingDocument(document)
    );
  }, []);

  if (!data?.ok) {
    return <CardSkeleton variant="detailed" />;
  }

  return (
    <div className="space-y-4">
      <PagingTable
        columns={columns}
        data={data.data.items}
        Toolbar={({ table }) => (
          <DocumentToolbar
            table={table}
            type={type}
            setType={setType}
            category={category}
            setCategory={setCategory}
            onUploadFile={() => setIsUploadDialogOpen(true)}
          />
        )}
        sorting={sorting}
        setSorting={setSorting}
        page={page}
        setPage={setPage}
        lastPage={data.data.lastPage}
      />
      <DocumentDialogs
        isUploadDialogOpen={isUploadDialogOpen}
        onCloseUploadDialog={() => setIsUploadDialogOpen(false)}
        buildingId={buildingId}
        editingDocument={editingDocument}
        onCloseEditDialog={() => setEditingDocument(null)}
        onCloseDeleteDialog={() => setDeletingDocument(null)}
        deletingDocument={deletingDocument}
      />
    </div>
  );
}
