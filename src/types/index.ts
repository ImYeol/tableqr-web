export type QueueStatus = "WAITING" | "CALLED" | "DONE" | "CANCELED";

export interface Store {
  store_id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  cover_url: string | null;
}

export interface Menu {
  menu_id: number;
  store_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
}

export interface Queue {
  queue_id: number;
  store_id: number;
  queue_number: number;
  status: QueueStatus;
  created_at: string;
  called_at: string | null;
}

