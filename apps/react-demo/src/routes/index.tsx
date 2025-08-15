import { createFileRoute } from "@tanstack/react-router";
import { CodeToggle } from "../components/CodeToggle";
import { Counter } from "../examples/Counter";
import code from "../examples/Counter?raw";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CodeToggle code={code}>
      <Counter />
    </CodeToggle>
  );
}
