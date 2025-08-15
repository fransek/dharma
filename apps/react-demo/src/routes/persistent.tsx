import { createFileRoute } from "@tanstack/react-router";
import { CodeToggle } from "../components/CodeToggle";
import { Persistent } from "../examples/Persistent";
import code from "../examples/Persistent?raw";

export const Route = createFileRoute("/persistent")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CodeToggle code={code}>
      <Persistent />
    </CodeToggle>
  );
}
