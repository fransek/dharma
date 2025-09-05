import { createStore, merge, type StateModifier } from "dharma-core";
import { useStore } from "dharma-react";
import { useRef } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

interface CountState {
  count: number;
}

interface TodoState {
  input: string;
  todos: { title: string; complete: boolean }[];
}

interface SharedState {
  countState: CountState;
  todoState: TodoState;
}

const initialState: SharedState = {
  countState: {
    count: 0,
  },
  todoState: {
    input: "",
    todos: [],
  },
};

const useRenderCount = () => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return renderCount.current;
};

const sharedStore = createStore(initialState, (set, get) => {
  const setCountState = (countState: StateModifier<CountState>) =>
    set((state) => ({
      countState: merge(state.countState, countState),
    }));

  const setTodoState = (todoState: StateModifier<TodoState>) =>
    set((state) => ({
      todoState: merge(state.todoState, todoState),
    }));

  return {
    countActions: {
      increment: () => setCountState((state) => ({ count: state.count + 1 })),
      decrement: () => setCountState((state) => ({ count: state.count - 1 })),
    },
    todoActions: {
      setInput: (input: string) => setTodoState({ input }),
      addTodo: () => {
        if (!get().todoState.input) {
          return;
        }
        setTodoState((state) => ({
          todos: [...state.todos, { title: state.input, complete: false }],
          input: "",
        }));
      },
      toggleTodo: (index: number) =>
        setTodoState((state) => ({
          todos: state.todos.map((todo, i) => {
            if (index === i) {
              return { ...todo, complete: !todo.complete };
            }
            return todo;
          }),
        })),
    },
  };
});

const useSharedStore = <T = SharedState,>(select?: (state: SharedState) => T) =>
  useStore(sharedStore, select);

const Counter = () => {
  const {
    state: { count },
    actions: {
      countActions: { increment, decrement },
    },
  } = useSharedStore((state) => state.countState);

  const renderCount = useRenderCount();

  return (
    <div className="flex flex-col gap-4 card items-start">
      <h2 className="font-bold">Counter</h2>
      <div className="grid grid-cols-3 text-center items-center">
        <Button onClick={decrement}>-</Button>
        <div aria-label="count">{count}</div>
        <Button onClick={increment}>+</Button>
      </div>
      <div className="text-sm" data-testid="counterRenderCount">
        Render count: {renderCount}
      </div>
    </div>
  );
};

const Todo = () => {
  const {
    state: { input, todos },
    actions: {
      todoActions: { addTodo, setInput, toggleTodo },
    },
  } = useSharedStore((state) => state.todoState);

  const renderCount = useRenderCount();

  return (
    <div className="container-full card" id="todo">
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
      <div className="text-sm" data-testid="todoRenderCount">
        Render count: {renderCount}
      </div>
    </div>
  );
};

export const Shared = () => {
  return (
    <div className="container-full w-fit">
      <Counter />
      <Todo />
    </div>
  );
};
