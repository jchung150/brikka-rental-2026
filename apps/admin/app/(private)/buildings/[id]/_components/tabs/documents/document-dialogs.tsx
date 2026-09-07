import { deleteDocument } from '@/@actions/documents/deleteDocument';
import { getDocument } from '@/@actions/documents/getDocument';
import type { DocumentListItem } from '@/@actions/documents/listDocuments';
import { Namespace } from '@/@hooks/query-keys';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/design-system/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { DocumentEditForm } from './document-edit-form';
import { DocumentForm } from './document-form';

interface DocumentDialogsProps {
  isUploadDialogOpen: boolean;
  onCloseUploadDialog: () => void;
  buildingId: number;
  editingDocument?: DocumentListItem | null;
  deletingDocument?: DocumentListItem | null;
  onCloseEditDialog: () => void;
  onCloseDeleteDialog: () => void;
}

export function DocumentDialogs({
  isUploadDialogOpen,
  onCloseUploadDialog,
  buildingId,
  editingDocument,
  deletingDocument,
  onCloseEditDialog,
  onCloseDeleteDialog,
}: DocumentDialogsProps) {
  const queryClient = useQueryClient();
  const [documentDetail, setDocumentDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [Namespace.Building, 'document', 'list'],
      exact: false,
    });
  }, [queryClient]);

  const loadDocumentDetail = useCallback(async (documentId: number) => {
    setIsLoadingDetail(true);
    try {
      const result = await getDocument(documentId);
      if (result.ok) {
        setDocumentDetail(result.data);
      } else {
        console.error('Failed to load document detail:', result.message);
      }
    } catch (error) {
      console.error('Error loading document detail:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // 편집 다이얼로그가 열릴 때 문서 상세 정보 로드
  useEffect(() => {
    if (editingDocument) {
      loadDocumentDetail(Number(editingDocument.id));
    }
  }, [editingDocument, loadDocumentDetail]);

  return (
    <>
      <Dialog open={isUploadDialogOpen} onOpenChange={onCloseUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>파일 업로드</DialogTitle>
            <DialogDescription>
              새로운 문서를 업로드합니다. 필수 항목을 모두 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <DocumentForm
            buildingId={buildingId}
            onSuccess={() => {
              onCloseUploadDialog();
              refetch();
            }}
            onCancel={onCloseUploadDialog}
          />
        </DialogContent>
      </Dialog>

      {editingDocument && (
        <Dialog open={!!editingDocument} onOpenChange={onCloseEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>문서 수정</DialogTitle>
              <DialogDescription>
                문서 정보를 수정합니다. 필요한 항목을 변경해주세요.
              </DialogDescription>
            </DialogHeader>
            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 text-sm">
                  문서 정보를 불러오는 중...
                </div>
              </div>
            ) : documentDetail ? (
              <DocumentEditForm
                documentId={Number(editingDocument.id)}
                buildingId={buildingId}
                initialData={{
                  category: documentDetail.category,
                  type: documentDetail.type,
                  title: documentDetail.title,
                  unitId: documentDetail.unitId,
                  memo: documentDetail.memo,
                  fileName: documentDetail.fileName,
                }}
                onSuccess={() => {
                  onCloseEditDialog();
                  refetch();
                  setDocumentDetail(null);
                }}
                onCancel={() => {
                  onCloseEditDialog();
                  setDocumentDetail(null);
                }}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      )}
      <DeleteDocumentDialog
        deletingDocument={deletingDocument}
        onCloseDeleteDialog={onCloseDeleteDialog}
      />
    </>
  );
}

const DeleteDocumentDialog = ({
  deletingDocument,
  onCloseDeleteDialog,
}: {
  deletingDocument?: DocumentListItem | null;
  onCloseDeleteDialog: () => void;
}) => {
  const queryClient = useQueryClient();
  const handleDelete = async () => {
    if (!deletingDocument) return;
    const result = await deleteDocument(deletingDocument.id.toString());
    if (result.ok) {
      onCloseDeleteDialog();
      queryClient.invalidateQueries({
        queryKey: [Namespace.Building, 'document', 'list'],
        exact: false,
      });
    }
  };
  return (
    <AlertDialog open={!!deletingDocument} onOpenChange={onCloseDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>문서 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            문서를 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCloseDeleteDialog}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
