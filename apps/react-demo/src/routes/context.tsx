import { createFileRoute } from "@tanstack/react-router";
import { CodeToggle } from "../components/CodeToggle";
import { Context } from "../examples/Context";
import code from "../examples/Context?raw";

export const Route = createFileRoute("/context")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CodeToggle code={code}>
      <Context />
    </CodeToggle>
  );
}
