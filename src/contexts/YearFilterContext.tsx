import { createContext, useContext, useState, ReactNode } from "react";

interface YearFilterContextType {
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
}

const YearFilterContext = createContext<YearFilterContextType | undefined>(undefined);

export function YearFilterProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  return (
    <YearFilterContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearFilterContext.Provider>
  );
}

export function useYearFilter() {
  const context = useContext(YearFilterContext);
  if (context === undefined) {
    throw new Error("useYearFilter must be used within a YearFilterProvider");
  }
  return context;
}
