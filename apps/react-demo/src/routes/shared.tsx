import { createFileRoute } from "@tanstack/react-router";
import { CodeToggle } from "../components/CodeToggle";
import { Shared } from "../examples/Shared";
import code from "../examples/Shared?raw";

export const Route = createFileRoute("/shared")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CodeToggle code={code}>
      <Shared />
    </CodeToggle>
  );
}
