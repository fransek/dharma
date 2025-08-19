import { createStore, useStore } from "dharma-react";

interface TodoState {
  input: string;
  todos: { title: string; complete: boolean }[];
}

const store = createStore(
  {
    input: "",
    todos: [],
  } as TodoState,
  (set, get) => ({
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
);

export const Todo = () => {
  const {
    state: { input, todos },
    actions: { addTodo, setInput, toggleTodo },
  } = useStore(store);

  return (
    <div className="flex flex-col gap-4">
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
              className={`list-disc list-inside cursor-pointer ${todo.complete && "line-through"}`}
            >
              {todo.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
