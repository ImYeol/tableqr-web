import Link from "next/link";

import { createSupabaseClient } from "@/lib/supabaseClient";
import type { Store } from "@/types";

export const revalidate = 60;

type StoreListItem = Pick<Store, "store_id" | "name" | "description" | "cover_url" | "address">;

const fetchStores = async () => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("stores")
    .select("store_id, name, description, cover_url, address")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Failed to load stores", error);
    return [];
  }

  console.log({data, error});

  return (data ?? []) as StoreListItem[];
};

const StoreCard = ({ store }: { store: StoreListItem }) => (
  <article className="flex flex-col rounded-2xl bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div className="mb-4 h-40 w-full overflow-hidden rounded-xl bg-neutral-100">
      {store.cover_url ? (
        <img alt={`${store.name} 대표 이미지`} className="h-full w-full object-cover" src={store.cover_url} />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-neutral-400">이미지 준비 중</div>
      )}
    </div>
    <h3 className="text-lg font-semibold text-neutral-900">{store.name}</h3>
    <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
      {store.description || "매장 소개가 준비 중입니다."}
    </p>
    {store.address ? <p className="mt-3 text-xs text-neutral-400">{store.address}</p> : null}
    <Link
      className="mt-4 inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
      href={`/store/${store.store_id}`}
    >
      매장 페이지 이동
    </Link>
  </article>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/70 p-10 text-center text-neutral-500">
    아직 등록된 매장이 없습니다. Supabase `stores` 테이블에 매장을 추가해 주세요.
  </div>
);

const StoresSection = async () => {
  const stores = await fetchStores();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-amber-600">TableQR</p>
        <h2 className="text-3xl font-semibold text-neutral-900">방문할 매장을 선택하세요</h2>
        <p className="max-w-2xl text-sm text-neutral-500">
          QR 코드를 스캔하거나 아래 목록에서 매장을 선택하면 실시간 메뉴판과 대기 현황을 확인할 수 있습니다.
        </p>
      </header>

      {stores.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.store_id} store={store} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </section>
  );
};

const HeroSection = () => (
  <section className="rounded-3xl bg-gradient-to-r from-[#F9F7F3] via-[#F1EBDD] to-[#F8F1E8] p-10 shadow-sm">
    <p className="text-sm uppercase tracking-[0.3em] text-amber-600">QR 기반 대기/메뉴</p>
    <h1 className="mt-4 text-4xl font-semibold text-neutral-900">
      줄 서지 않는 매장 경험, <span className="text-amber-600">TableQR</span>로 시작하세요.
    </h1>
    <p className="mt-4 text-base leading-7 text-neutral-600">
      고객은 QR 코드 하나로 메뉴판과 대기 상황을 확인하고, 매장은 실시간으로 대기 팀을 관리할 수 있습니다.
    </p>
  </section>
);

export default async function Home() {
  return (
    <div className="min-h-screen bg-[#F9F7F3]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-5 py-12">
        <HeroSection />
        <StoresSection />
      </div>
    </div>
  );
}
