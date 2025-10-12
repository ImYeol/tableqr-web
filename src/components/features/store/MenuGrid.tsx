import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Menu } from "@/types";

interface MenuGridProps {
  menus: Menu[];
}

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

export const MenuGrid = ({ menus }: MenuGridProps) => {
  if (!menus.length) {
    return (
      <section className="rounded-2xl bg-white/80 p-6 text-center text-neutral-500 shadow-sm">
        준비된 메뉴가 없습니다.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="px-1">
        <h2 className="text-2xl font-semibold text-neutral-900">메뉴</h2>
        <p className="text-sm text-neutral-500">Shadcn Card 컴포넌트로 구성된 메뉴판입니다.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {menus.map((menu) => (
          <Card key={menu.menu_id} className="overflow-hidden border-none bg-white/90">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-xl text-neutral-900">{menu.name}</CardTitle>
                {menu.description ? (
                  <p className="mt-1 text-sm leading-6 text-neutral-500">{menu.description}</p>
                ) : null}
              </div>
              <span className="shrink-0 whitespace-nowrap text-lg font-semibold text-amber-600">
                {currencyFormatter.format(menu.price)}
              </span>
            </CardHeader>
            {menu.image_url ? (
              <CardContent className="pt-0">
                <div className="h-36 w-full overflow-hidden rounded-xl bg-neutral-100">
                  <img alt={`${menu.name} 이미지`} className="h-full w-full object-cover" src={menu.image_url} />
                </div>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
};

