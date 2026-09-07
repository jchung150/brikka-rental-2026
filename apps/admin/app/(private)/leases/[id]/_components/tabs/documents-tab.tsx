'use client';
import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { useDocuments } from '@/@hooks/use-documents';
import type { SortingState } from '@tanstack/react-table';
import {} from 'lucide-react';
import { useState } from 'react';
import { DocumentsTable } from './documents-table';
import { UploadDocumentDialog } from './upload-document-dialog';

interface DocumentsTabProps {
  lease: LeaseDetail;
}

export function DocumentsTab({ lease: _lease }: DocumentsTabProps) {
  const { data, isLoading, error, lastPage } = useDocuments({
    wh: {
      leaseId: Number(_lease.id),
    },
  });

  const documents = data ?? [];
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <DocumentsTable
        documents={documents}
        sorting={sorting}
        setSorting={setSorting}
        page={page}
        setPage={setPage}
        lastPage={lastPage}
        handleUpload={() => {
          setIsUploadDialogOpen(true);
        }}
      />

      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        leaseId={Number(_lease.id)}
      />
    </div>
  );
}
