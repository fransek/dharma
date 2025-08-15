import { createFileRoute } from "@tanstack/react-router";
import { CodeToggle } from "../components/CodeToggle";
import { Async } from "../examples/Async";
import code from "../examples/Async?raw";

export const Route = createFileRoute("/async")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CodeToggle code={code}>
      <Async />
    </CodeToggle>
  );
}
