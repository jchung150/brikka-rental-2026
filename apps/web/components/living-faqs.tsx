'use client';

import {
  type LiviingFaqTab,
  livingFaqTabs,
  livingFaqs,
} from '@/@data/living-faqs';
import { Button } from '@repo/design-system/components/ui/button';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { cn } from '@repo/design-system/lib/utils';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';
import BrikkaSelect from './brikka-select';
import FaqAccordion from './faq-accordion';

function CategoryTabs({
  currentTab,
  setCurrentTab,
}: {
  currentTab: LiviingFaqTab;
  setCurrentTab: Dispatch<SetStateAction<LiviingFaqTab>>;
}) {
  return (
    <nav className="mb-[34px]">
      <ul className="scrollbar-hidden flex w-full items-center gap-[12px] overflow-x-auto px-[20px] md:justify-center">
        {livingFaqTabs.map((tab) => {
          const isActive = currentTab === tab.value;
          return (
            <li key={tab.value}>
              <Button
                variant="apc-outlined"
                size="apc-md"
                onClick={() => setCurrentTab(tab.value)}
                className={cn(
                  'h-[50px] min-w-[100px] rounded-none lg:h-[60px]',
                  {
                    'bg-apc-black-900 text-white-100 hover:bg-apc-black-900':
                      isActive,
                  }
                )}
              >
                {tab.label}
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CategorySelect({
  currentTab,
  setCurrentTab,
}: {
  currentTab: LiviingFaqTab;
  setCurrentTab: Dispatch<SetStateAction<LiviingFaqTab>>;
}) {
  const handleValueChange = useCallback(
    (value: string) => {
      setCurrentTab(value as LiviingFaqTab);
    },
    [setCurrentTab]
  );

  return (
    <div className="mb-[34px]">
      <BrikkaSelect
        value={currentTab}
        onValueChange={handleValueChange}
        values={livingFaqTabs.map((tab) => ({
          label: tab.label,
          value: tab.value,
        }))}
        centered
      />
    </div>
  );
}

export default function LivingFaqs() {
  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState<LiviingFaqTab>('all');

  const filteredFaqs =
    currentTab === 'all'
      ? livingFaqs
      : livingFaqs.filter((faq) => faq.category === currentTab);

  return (
    <div>
      {isMobile ? (
        <CategorySelect currentTab={currentTab} setCurrentTab={setCurrentTab} />
      ) : (
        <CategoryTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      <FaqAccordion faqs={filteredFaqs} />
    </div>
  );
}
