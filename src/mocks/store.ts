import type { Menu, Store } from "@/types";

const BASE_STORE: Store = {
  store_id: 1,
  name: "오로라 테이블",
  description: "계절마다 바뀌는 시그니처 메뉴와 감각적인 공간을 경험해 보세요.",
  address: "서울시 마포구 와우산로 123",
  phone: "02-1234-5678",
  logo_url: "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=200&q=80",
  cover_url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1600&q=80",
};

const BASE_MENUS: Menu[] = [
  {
    menu_id: 101,
    store_id: BASE_STORE.store_id,
    name: "시그니처 오로라 라떼",
    description: "에스프레소, 바닐라 크림, 시나몬 폼이 어우러진 하우스 스페셜 라떼.",
    category: "시그니처",
    price: 6200,
    image_url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80",
    is_active: true,
  },
  {
    menu_id: 102,
    store_id: BASE_STORE.store_id,
    name: "라임 스파클 에이드",
    description: "미세한 버블과 라임이 상큼하게 어우러진 청량한 스파클 음료.",
    category: "에이드",
    price: 5700,
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    is_active: true,
  },
  {
    menu_id: 103,
    store_id: BASE_STORE.store_id,
    name: "솔티드 카라멜 와플",
    description: "겉은 바삭, 속은 촉촉한 와플에 카라멜과 바닐라 빈 아이스크림을 더했습니다.",
    category: "디저트",
    price: 8800,
    image_url: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=900&q=80",
    is_active: true,
  },
  {
    menu_id: 104,
    store_id: BASE_STORE.store_id,
    name: "트러플 머쉬룸 리소토",
    description: "부드러운 아르보리오 라이스와 트러플 오일이 풍미를 더한 플래터 메뉴.",
    category: "브런치",
    price: 12800,
    image_url: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80",
    is_active: true,
  },
];

export const getMockStore = (storeId: number): Store => ({
  ...BASE_STORE,
  store_id: storeId,
});

export const getMockMenus = (storeId: number): Menu[] =>
  BASE_MENUS.map((menu) => ({
    ...menu,
    store_id: storeId,
  }));

export const getMockMenu = (storeId: number, menuId: number): Menu | null => {
  const baseMenu = BASE_MENUS.find((menu) => menu.menu_id === menuId);

  if (!baseMenu) {
    return null;
  }

  return {
    ...baseMenu,
    store_id: storeId,
  };
};
