'use client';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BrMobile } from './common';

const STORAGE_KEY = 'brikka-intro-popup-shown';

export default function GlobalIntroPopup() {
  const [showing, setShowing] = useState(false);

  const handleClose = () => {
    setShowing(false);
  };

  const handleTodayClose = () => {
    const today = dayjs().format('YYYY-MM-DD');
    localStorage.setItem(STORAGE_KEY, today);
    setShowing(false);
  };

  useEffect(() => {
    // localStorage에서 오늘 날짜 확인
    const storedDate = localStorage.getItem(STORAGE_KEY);
    const today = dayjs().format('YYYY-MM-DD');

    if (storedDate === today) {
      // 오늘 날짜와 같으면 팝업을 표시하지 않음
      setShowing(false);
    } else {
      // 오늘 날짜와 다르면 팝업 표시
      setShowing(true);
    }
  }, []);

  useEffect(() => {
    if (!showing) {
      return;
    }

    const preventWheel = (e: WheelEvent) => {
      e.preventDefault();
    };

    document.body.addEventListener('wheel', preventWheel, { passive: false });

    return () => {
      document.body.removeEventListener('wheel', preventWheel);
    };
  }, [showing]);

  if (!showing) {
    return null;
  }

  return (
    <Dialog open={showing} onOpenChange={setShowing}>
      <DialogContent
        className="max-h-[90vh] w-[90vw] overflow-y-auto p-0 md:max-w-[480px]"
        hideCloseButton
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <Image
          src="/images/global-popup-box-bg.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="relative flex flex-col items-center gap-[20px] py-[50px] text-center lg:gap-[60px] lg:py-[99px]">
          <div className="flex flex-col gap-[16px]">
            <span className="font-indivisible font-semibold text-[16px] text-apc-orange-500">
              WELCOME
            </span>
            <DialogTitle>
              <span className="text-[24px] sm:text-[28px]">
                첫 입주를 축하합니다!
              </span>
            </DialogTitle>
          </div>
          <div className="bg-white-a30 px-[8px] py-[36px] lg:px-[16px]">
            <p className="font-medium text-[18px] sm:text-[21px]">
              브리카의 첫 번째 공간, 브리카 이촌이
              <br />
              <span className="text-apc-orange-500">6월 1일 첫 입주</span>를
              시작합니다.
              <br />
              당신의 새로운 라이프스타일을 <BrMobile />
              만나보세요.
            </p>
          </div>
        </div>
        <div className="relative flex h-[50px] bg-white lg:h-[70px]">
          <button
            type="button"
            className="flex-1 font-bold text-[12px] text-coolgray-750 sm:text-[16px]"
            onClick={handleTodayClose}
          >
            오늘 하루 안보기
          </button>
          <button
            type="button"
            className="flex-1 font-bold text-[12px] text-apc-foreground sm:text-[16px]"
            onClick={handleClose}
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
