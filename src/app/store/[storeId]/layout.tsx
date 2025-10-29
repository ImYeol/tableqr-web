import type { ReactNode } from "react";

import { OrderNumberProvider } from "@/components/features/store/OrderNumberContext";

const StoreLayout = ({ children }: { children: ReactNode }) => <OrderNumberProvider>{children}</OrderNumberProvider>;

export default StoreLayout;

