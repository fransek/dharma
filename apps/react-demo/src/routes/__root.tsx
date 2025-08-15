import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useStore } from "dharma-react";
import { Menu, X } from "lucide-react";
import { Nav, navStore } from "../components/Nav";
import { FileRouteTypes } from "../routeTree.gen";

export const Route = createRootRoute({
  component: RootComponent,
});

const routes: {
  path: FileRouteTypes["to"];
  title: string;
}[] = [
  { path: "/", title: "Basic counter" },
  { path: "/context", title: "Counter + context" },
  { path: "/persistent", title: "Counter + persistent state" },
  { path: "/todo", title: "To do app" },
  { path: "/async", title: "Async actions" },
  { path: "/shared", title: "Shared store" },
];

function RootComponent() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  const {
    state: { isOpen },
    actions: { toggle },
  } = useStore(navStore);

  return (
    <div className="flex flex-col md:flex-row">
      <Nav routes={routes} />
      <div className="w-full overflow-auto">
        <header className="p-4 w-full flex justify-between items-center">
          <h1 className="font-bold text-lg">
            {routes.find(({ path }) => path === pathname)?.title || "Demo"}
          </h1>
          <button
            onClick={toggle}
            className="md:hidden border-0 text-xl z-10 p-0"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </header>
        <hr />
        <main className="p-4 flex flex-col gap-4 items-start">
          <Outlet />
        </main>
      </div>
      {process.env.NODE_ENV === "development" && (
        <TanStackRouterDevtools position="bottom-right" />
      )}
    </div>
  );
}
