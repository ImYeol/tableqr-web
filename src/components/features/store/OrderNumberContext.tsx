'use client';

import { createContext, useContext, useMemo, useState } from "react";

type OrderNumberContextValue = {
  orderNumber: number | null;
  setOrderNumber: React.Dispatch<React.SetStateAction<number | null>>;
};

const OrderNumberContext = createContext<OrderNumberContextValue | undefined>(undefined);

export const OrderNumberProvider = ({ children }: { children: React.ReactNode }) => {
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const value = useMemo<OrderNumberContextValue>(() => ({ orderNumber, setOrderNumber }), [orderNumber]);

  return <OrderNumberContext.Provider value={value}>{children}</OrderNumberContext.Provider>;
};

export const useOrderNumber = (): OrderNumberContextValue => {
  const context = useContext(OrderNumberContext);

  if (!context) {
    throw new Error("useOrderNumber must be used within an OrderNumberProvider");
  }

  return context;
};

