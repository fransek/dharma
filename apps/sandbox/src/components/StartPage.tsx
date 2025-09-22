import { links } from "../lib/constants";
import { Button } from "./ui/button";

export const StartPage = () => (
  <>
    <h1 className="text-3xl font-bold">Dharma Sandbox</h1>
    <nav>
      <ul>
        {links.map((l) => (
          <li className="text-center" key={l.href}>
            <Button asChild variant="link" size="sm">
              <a href={l.href}>{l.label}</a>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  </>
);
