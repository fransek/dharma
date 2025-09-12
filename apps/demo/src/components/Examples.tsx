import type React from "react";
import type { FC } from "react";
import { CodeToggle } from "./CodeToggle";
import { Async } from "./react/Async";
import { Context } from "./react/Context";
import { Counter } from "./react/Counter";
import { Persistent } from "./react/Persistent";
import { PersistentAsync } from "./react/PersistentAsync";
import { Shared } from "./react/Shared";
import { Todo } from "./react/Todo";

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
