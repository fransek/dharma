import { createStore } from "dharma-core";
import { createStoreContext, useStore, useStoreContext } from "dharma-react";
import { useMemo } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

interface TodoState {
  input: string;
  todos: { title: string; complete: boolean }[];
}

const createTodoStore = (initialState: TodoState) => {
  return createStore({
    initialState,
    defineActions: ({ set, get }) => ({
      setInput: (input: string) => set({ input }),
      addTodo: () => {
        if (!get().input) {
          return;
        }
        set((state) => ({
          todos: [...state.todos, { title: state.input, complete: false }],
          input: "",
        }));
      },
      toggleTodo: (index: number) =>
        set((state) => ({
          todos: state.todos.map((todo, i) => {
            if (index === i) {
              return { ...todo, complete: !todo.complete };
            }
            return todo;
          }),
        })),
    }),
  });
};

const TodoStoreContext = createStoreContext<typeof createTodoStore>();

interface Props {
  initialTodos?: { title: string; complete: boolean }[];
  instanceNumber: number;
}

export const TodoApp = ({ initialTodos = [], instanceNumber }: Props) => {
  const store = useMemo(
    () =>
      createTodoStore({
        input: "",
        todos: initialTodos,
      }),
    [initialTodos],
  );
  const { setInput, addTodo } = store.actions;
  const { input, todos } = useStore(store);

  return (
    <TodoStoreContext.Provider value={store}>
      <div className="flex flex-col gap-4 container-full w-fit card">
        <h2 className="font-bold">To do (context {instanceNumber})</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTodo();
          }}
          className="flex gap-2 max-w-lg"
        >
          <Input
            aria-label="Add a new todo"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
        {todos.length > 0 && <Todos instanceNumber={instanceNumber} />}
      </div>
    </TodoStoreContext.Provider>
  );
};

const Todos = ({ instanceNumber }: { instanceNumber: number }) => {
  const {
    actions: { toggleTodo },
    state: { todos },
  } = useStoreContext(TodoStoreContext);

  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={todo.title} className="flex items-center gap-2">
          <Checkbox
            checked={todo.complete}
            onCheckedChange={() => toggleTodo(index)}
            id={`todo-${instanceNumber}-${index}`}
          />
          <label
            htmlFor={`todo-${instanceNumber}-${index}`}
            className={cn(
              "transition-colors",
              todo.complete && "line-through text-foreground/60",
            )}
          >
            {todo.title}
          </label>
        </li>
      ))}
    </ul>
  );
};

export const ContextExample = () => (
  <div className="flex flex-wrap gap-4 justify-center items-start">
    <TodoApp
      instanceNumber={1}
      initialTodos={[{ title: "Learn Dharma", complete: false }]}
    />
    <TodoApp
      instanceNumber={2}
      initialTodos={[{ title: "Buy milk", complete: false }]}
    />
  </div>
);
