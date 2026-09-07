'use client';

import { individualSpaces } from '@/@data/living-individual-spaces';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { XIcon } from 'lucide-react';
import { useCallback } from 'react';
import {
  useLivingContextDispatch,
  useLivingContextState,
} from '../../app/(pages)/living/_context';
import BannerSwiper from './banner-swiper';
import Facilities from './facilities';
import Faqs from './faqs';
import SpaceType from './space-type';

export default function LivingIndividualSpaceDialog() {
  const { selectedIndividualSpaceId } = useLivingContextState();
  const { setSelectedIndividualSpaceId } = useLivingContextDispatch();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSelectedIndividualSpaceId(null);
      }
    },
    [setSelectedIndividualSpaceId]
  );

  const space = individualSpaces.find(
    (space) => space.id === selectedIndividualSpaceId
  );

  return (
    <Dialog open={!!space} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="!rounded-none h-[90vh] w-[90vw] overflow-y-auto border-none p-0 md:max-w-[1440px]"
      >
        <DialogTitle className="sr-only">{space?.title}</DialogTitle>
        <DialogClose className="absolute top-[20px] right-[20px] z-10 bg-apc-black-a60">
          <XIcon className="size-[24px] text-white lg:size-[32px]" />
        </DialogClose>
        <BannerSwiper images={space?.images ?? []} />
        <div className="px-[20px] lg:px-[50px]">
          <SpaceType
            spaceType={space?.type ?? ''}
            monthlyRent={space?.monthlyRent ?? 0}
            deposit={space?.deposit ?? 0}
          />
          <Facilities options={space?.options ?? []} />
          <Faqs faqs={space?.faqs ?? []} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
