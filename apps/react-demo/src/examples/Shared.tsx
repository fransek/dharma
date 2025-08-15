import { createStore, merge, StateModifier } from "dharma-core";
import { useStore } from "dharma-react";

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

let counterRenderCount = 0;

const Counter = () => {
  const {
    state: { count },
    actions: {
      countActions: { increment, decrement },
    },
  } = useSharedStore((state) => state.countState);

  return (
    <div className="flex flex-col gap-4 border p-4 rounded items-start">
      <h2 className="font-bold">Counter</h2>
      <div className="grid grid-cols-3 text-center items-center">
        <button onClick={decrement}>-</button>
        <div aria-label="count">{count}</div>
        <button onClick={increment}>+</button>
      </div>
      <div className="text-sm" data-testid="counterRenderCount">
        Render count: {++counterRenderCount}
      </div>
    </div>
  );
};

let todoRenderCount = 0;

const Todo = () => {
  const {
    state: { input, todos },
    actions: {
      todoActions: { addTodo, setInput, toggleTodo },
    },
  } = useSharedStore((state) => state.todoState);

  return (
    <div
      className="flex flex-col gap-4 border p-4 rounded items-start"
      id="todo"
    >
      <h2 className="font-bold">To do</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
      >
        <input
          aria-label="Add a new todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mr-2"
        />
        <button type="submit">Add</button>
      </form>
      {todos.length > 0 && (
        <ul>
          {todos.map((todo, index) => (
            <li
              key={todo.title}
              data-testid={`todo-${index}`}
              role="button"
              onClick={() => toggleTodo(index)}
              className={`list-disc list-inside ${todo.complete && "line-through"}`}
            >
              {todo.title}
            </li>
          ))}
        </ul>
      )}
      <div className="text-sm" data-testid="todoRenderCount">
        Render count: {++todoRenderCount}
      </div>
    </div>
  );
};

export const Shared = () => {
  return (
    <div className="flex flex-col gap-4 w-fit">
      <Counter />
      <Todo />
    </div>
  );
};
