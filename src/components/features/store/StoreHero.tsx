import type { Store } from "@/types";

interface StoreHeroProps {
  store: Store;
}

export const StoreHero = ({ store }: StoreHeroProps) => (
  <section className="rounded-2xl bg-white/80 p-6 shadow-sm backdrop-blur md:flex md:items-center md:gap-8">
    {store.cover_url ? (
      <div className="mb-4 h-32 w-full overflow-hidden rounded-2xl bg-neutral-100 md:mb-0 md:h-40 md:w-64">
        <img
          alt={`${store.name} 대표 이미지`}
          className="h-full w-full object-cover"
          src={store.cover_url}
        />
      </div>
    ) : null}
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-widest text-amber-600">Welcome</p>
        <h1 className="text-3xl font-semibold text-neutral-900 md:text-4xl">{store.name}</h1>
      </div>
      {store.description ? (
        <p className="max-w-2xl text-base leading-7 text-neutral-600">{store.description}</p>
      ) : (
        <p className="text-neutral-400">매장 소개가 준비 중입니다.</p>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
        {store.address ? <span>📍 {store.address}</span> : null}
        {store.phone ? <span>☎️ {store.phone}</span> : null}
      </div>
    </div>
  </section>
);

