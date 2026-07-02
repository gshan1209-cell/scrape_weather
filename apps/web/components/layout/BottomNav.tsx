import { CloudSun, Home, Settings } from "lucide-react";
import Link from "next/link";

const items = [
  { href: "/", label: "首頁", icon: Home },
  { href: "/forecast", label: "預報", icon: CloudSun },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white md:hidden">
      <div className="grid grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-stone-600">
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
