import type React from "react";
import type { FC } from "react";
import { CodeToggle } from "./CodeToggle";
import { Async } from "./examples/Async";
import { Context } from "./examples/Context";
import { Counter } from "./examples/Counter";
import { Persistent } from "./examples/Persistent";
import { PersistentAsync } from "./examples/PersistentAsync";
import { Shared } from "./examples/Shared";
import { Todo } from "./examples/Todo";

interface Props {
  children: React.ReactNode;
}
export const AsyncExample: FC<Props> = ({ children }) => (
  <CodeToggle component={<Async />}>{children}</CodeToggle>
);
export const ContextExample: FC<Props> = ({ children }) => (
  <CodeToggle component={<Context />}>{children}</CodeToggle>
);
export const CounterExample: FC<Props> = ({ children }) => (
  <CodeToggle component={<Counter />}>{children}</CodeToggle>
);
export const PersistentExample: FC<Props> = ({ children }) => (
  <CodeToggle component={<Persistent />}>{children}</CodeToggle>
);
export const PersistentAsyncExample: FC<Props> = ({ children }) => (
  <CodeToggle component={<PersistentAsync />}>{children}</CodeToggle>
);
export const SharedExample: FC<Props> = ({ children }) => (
  <CodeToggle component={<Shared />}>{children}</CodeToggle>
);
export const TodoExample: FC<Props> = ({ children }) => (
  <CodeToggle component={<Todo />}>{children}</CodeToggle>
);
