import { createFileRoute } from "@tanstack/react-router";
import { CodeToggle } from "../components/CodeToggle";
import { Todo } from "../examples/Todo";
import code from "../examples/Todo?raw";

export const Route = createFileRoute("/todo")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CodeToggle code={code}>
      <Todo />
    </CodeToggle>
  );
}
