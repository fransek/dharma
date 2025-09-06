import { createStore } from "dharma-core";
import { useStore } from "dharma-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

// Set up the store

interface TodoState {
  input: string;
  todos: { title: string; complete: boolean }[];
}

const initialState: TodoState = {
  input: "",
  todos: [],
};

const store = createStore(initialState, (set, get) => ({
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
}));

const { setInput, addTodo, toggleTodo } = store.actions;

// Bind the store to the component

export const Todo = () => {
  const { input, todos } = useStore(store);

  return (
    <div className="flex flex-col gap-4 container-full w-fit">
      <h2 className="font-bold">To do</h2>
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
      {todos.length > 0 && (
        <ul>
          {todos.map((todo, index) => (
            <li
              key={todo.title}
              data-testid={`todo-${index}`}
              className="flex items-center gap-2"
            >
              <Checkbox
                checked={todo.complete}
                onCheckedChange={() => toggleTodo(index)}
                id={`todo-${index}`}
              />
              <label
                htmlFor={`todo-${index}`}
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
      )}
    </div>
  );
};
