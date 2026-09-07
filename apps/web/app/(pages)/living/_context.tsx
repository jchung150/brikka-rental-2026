'use client';

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

type LivingContextStateType = {
  selectedIndividualSpaceId: number | null;
};

type LivingContextDispatchType = {
  setSelectedIndividualSpaceId: Dispatch<SetStateAction<number | null>>;
};

const LivingContext = createContext<LivingContextStateType | null>(null);
const LivingContextDispatch = createContext<LivingContextDispatchType | null>(
  null
);

export default function LivingProvider({ children }: { children: ReactNode }) {
  const [selectedIndividualSpaceId, setSelectedIndividualSpaceId] = useState<
    number | null
  >(null);

  const memoizedDispatch = useMemo(
    () => ({ setSelectedIndividualSpaceId }),
    []
  );

  return (
    <LivingContextDispatch.Provider value={memoizedDispatch}>
      <LivingContext.Provider value={{ selectedIndividualSpaceId }}>
        {children}
      </LivingContext.Provider>
    </LivingContextDispatch.Provider>
  );
}

export function useLivingContextState() {
  const context = useContext(LivingContext);
  if (!context) {
    throw new Error('useLivingContext must be used within a LivingProvider');
  }
  return context;
}

export function useLivingContextDispatch() {
  const context = useContext(LivingContextDispatch);
  if (!context) {
    throw new Error(
      'useLivingContextDispatch must be used within a LivingProvider'
    );
  }
  return context;
}
