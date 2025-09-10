/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore } from "dharma-core";
import { useStore } from "dharma-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

// Enhanced Todo store with derived values

interface TodoState {
  input: string;
  todos: { title: string; complete: boolean }[];
  filter: "all" | "completed" | "active";
}

const initialState: TodoState = {
  input: "",
  todos: [
    { title: "Learn dharma state management", complete: true },
    { title: "Build an awesome app", complete: false },
    { title: "Share with the community", complete: false },
  ],
  filter: "all",
};

const store = createStore({
  initialState,
  defineActions: ({ set, get }) => ({
    setInput: (input: string) => set({ input }),
    addTodo: () => {
      if (!get().input.trim()) return;
      set((state) => ({
        todos: [...state.todos, { title: state.input.trim(), complete: false }],
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
    deleteTodo: (index: number) =>
      set((state) => ({
        todos: state.todos.filter((_, i) => i !== index),
      })),
    setFilter: (filter: "all" | "completed" | "active") => set({ filter }),
    clearCompleted: () =>
      set((state) => ({
        todos: state.todos.filter((todo) => !todo.complete),
      })),
  }),
  // ✨ Derived values - automatically computed whenever state changes
  defineDerivedValues: (state) => ({
    // Filter todos based on current filter
    filteredTodos: state.todos.filter((todo) => {
      if (state.filter === "completed") return todo.complete;
      if (state.filter === "active") return !todo.complete;
      return true; // "all"
    }),
    // Count statistics
    totalCount: state.todos.length,
    completedCount: state.todos.filter((todo) => todo.complete).length,
    activeCount: state.todos.filter((todo) => !todo.complete).length,
    // Computed percentages
    completionPercentage:
      state.todos.length > 0
        ? Math.round(
            (state.todos.filter((todo) => todo.complete).length /
              state.todos.length) *
              100,
          )
        : 0,
    // Check if all todos are completed
    allCompleted:
      state.todos.length > 0 && state.todos.every((todo) => todo.complete),
    // Check if there are any completed todos
    hasCompleted: state.todos.some((todo) => todo.complete),
  }),
});

const { setInput, addTodo, toggleTodo, deleteTodo, setFilter, clearCompleted } =
  store.actions;

export const DerivedValues = () => {
  const state = useStore(store) as typeof store extends { get(): infer T }
    ? T
    : never;
  const {
    input,
    filter,
    // Base state
    todos,
    // ✨ Derived values - automatically available!
    filteredTodos,
    totalCount,
    completedCount,
    activeCount,
    completionPercentage,
    allCompleted,
    hasCompleted,
  } = state as any;

  return (
    <div className="flex flex-col gap-6 container-full w-fit max-w-2xl">
      <div>
        <h2 className="font-bold text-xl mb-2">
          Enhanced Todo with Derived Values
        </h2>
        <p className="text-sm text-muted-foreground">
          This demo showcases derived values that are automatically computed
          whenever the state changes.
        </p>
      </div>

      {/* Statistics Panel - All derived values! */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedCount}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {activeCount}
          </div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {completionPercentage}%
          </div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      </div>

      {/* Progress Bar - Uses derived values */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                allCompleted ? "bg-green-500" : "bg-blue-500",
              )}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Todo Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Add a new todo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!input.trim()}>
          Add
        </Button>
      </form>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {["all", "active", "completed"].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setFilter(filterOption as "all" | "completed" | "active")
            }
          >
            {filterOption === "all"
              ? "All"
              : filterOption === "active"
                ? "Active"
                : "Completed"}
            {filterOption === "all" && totalCount > 0 && ` (${totalCount})`}
            {filterOption === "active" &&
              activeCount > 0 &&
              ` (${activeCount})`}
            {filterOption === "completed" &&
              completedCount > 0 &&
              ` (${completedCount})`}
          </Button>
        ))}
        {hasCompleted && (
          <Button variant="destructive" size="sm" onClick={clearCompleted}>
            Clear Completed
          </Button>
        )}
      </div>

      {/* Todo List - Uses filteredTodos derived value */}
      {filteredTodos.length > 0 ? (
        <div className="space-y-2">
          {filteredTodos.map((todo: any) => {
            // Find the original index in the full todos array
            const originalIndex = todos.findIndex((t: any) => t === todo);
            return (
              <div
                key={`${todo.title}-${originalIndex}`}
                className="flex items-center gap-3 p-3 bg-card rounded-lg border group hover:shadow-sm transition-shadow"
              >
                <Checkbox
                  checked={todo.complete}
                  onCheckedChange={() => toggleTodo(originalIndex)}
                  id={`todo-${originalIndex}`}
                />
                <label
                  htmlFor={`todo-${originalIndex}`}
                  className={cn(
                    "flex-1 transition-colors cursor-pointer",
                    todo.complete && "line-through text-muted-foreground",
                  )}
                >
                  {todo.title}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(originalIndex)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {filter === "all" && "No todos yet. Add one above!"}
          {filter === "active" && "No active todos. Great job! 🎉"}
          {filter === "completed" && "No completed todos yet."}
        </div>
      )}

      {/* Status Message - Uses derived values */}
      {totalCount > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {allCompleted ? (
            <span className="text-green-600 font-medium">
              🎉 All tasks completed! Excellent work!
            </span>
          ) : activeCount === 1 ? (
            "1 task remaining"
          ) : (
            `${activeCount} tasks remaining`
          )}
        </div>
      )}
    </div>
  );
};
