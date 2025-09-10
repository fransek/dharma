import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface NavLink {
  href: string;
  label: string;
  className?: string;
}

const links: NavLink[] = [
  { href: "/counter", label: "Counter" },
  { href: "/todo", label: "Todo" },
  { href: "/context", label: "Context" },
  { href: "/shared", label: "Shared" },
  { href: "/persistent", label: "Persistent" },
  { href: "/async-storage", label: "Async Storage" },
  { href: "/async", label: "Async" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="card rounded-none border-0 border-b p-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Button asChild variant="link" size="sm">
          <a href="/" className="font-bold text-sm">
            dharma
          </a>
        </Button>

        {/* Desktop menu */}
        <ul
          id="main-menu"
          className="hidden md:flex md:flex-row md:items-center md:overflow-x-auto md:[scrollbar-width:none] text-sm"
        >
          {links.map((l) => (
            <li key={l.href}>
              <Button asChild variant="link" size="sm">
                <a href={l.href}>{l.label}</a>
              </Button>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="md:hidden"
          aria-label="Toggle navigation menu"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Menu />
        </Button>
      </div>

      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile side drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-72 max-w-[80vw] md:hidden border-l bg-background shadow-xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-between p-2">
          <ul className="flex flex-col gap-1 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Button asChild variant="link" size="sm">
                  <a href={l.href} onClick={() => setOpen(false)}>
                    {l.label}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
      </aside>
    </nav>
  );
}
