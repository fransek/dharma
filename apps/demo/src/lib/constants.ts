interface NavLink {
  href: string;
  label: string;
  className?: string;
}

export const links: NavLink[] = [
  { href: "/counter", label: "Counter" },
  { href: "/todo", label: "Todo" },
  { href: "/context", label: "Context" },
  { href: "/shared", label: "Shared" },
  { href: "/persistent", label: "Persistent" },
  { href: "/async-storage", label: "Async Storage" },
  { href: "/async", label: "Async" },
  { href: "/derived", label: "Derived" },
  { href: "/effect", label: "Effect" },
];
