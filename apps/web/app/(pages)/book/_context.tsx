'use client';

import { type ReactNode, createContext, useContext } from 'react';

type BookContextType = {
  start: string;
  end: string;
};

const BookContext = createContext<BookContextType | null>(null);

export default function BookProvider({
  start,
  end,
  children,
}: { start: string; end: string; children: ReactNode }) {
  return (
    <BookContext.Provider value={{ start, end }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBookContextState() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBookContext must be used within a BookProvider');
  }
  return context;
}
