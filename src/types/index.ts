export type QueueStatus = "WAITING" | "CALLED" | "DONE" | "CANCELED";

export interface Store {
  store_id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  cover_url: string | null;
  business_hours: string | null;
  notice: string | null;
}

export interface Menu {
  menu_id: number;
  store_id: number;
  category_id: number | null;
  category: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  allergy_info: string[] | null;
  display_order: number;
  updated_at: string | null;
}

export interface MenuCategory {
  category_id: number;
  store_id: number;
  name: string;
  description: string | null;
  display_order: number;
}

export interface Queue {
  queue_id: number;
  store_id: number;
  queue_number: number;
  status: number;
  created_at: string;
  called_at: string | null;
}

export interface QueueItem {
  queue_item_id: number;
  queue_id: number;
  menu_id: number;
  menu_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface StoreCachePayload {
  store: Store;
  menus: Menu[];
  categories: MenuCategory[];
  cachedAt: string;
  source: "supabase" | "mock";
}
