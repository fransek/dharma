import { createStore } from "dharma-core";
import { useStore } from "dharma-react";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface State {
  users: User[];
  loading: boolean;
}

const fetchUsers = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  return await response.json();
};

const store = createStore(
  { users: [], loading: true } as State,
  ({ set }) => ({
    refresh: async () => {
      set({ users: [], loading: true });
      const users = await fetchUsers();
      set({ users: users, loading: false });
    },
  }),
  {
    onAttach: async ({ state, set }) => {
      if (state.users.length) {
        return;
      }
      const users = await fetchUsers();
      set({ users: users, loading: false });
    },
  },
);

const { refresh } = store.actions;

export function Async() {
  const { users, loading } = useStore(store);

  return (
    <div className="container-full w-fit">
      {loading ? (
        <div data-testid="loading">Fetching users...</div>
      ) : (
        <>
          <Button onClick={refresh} className="w-fit">
            Refresh
            <RefreshCw />
          </Button>
          {users.map((user, index) => (
            <div key={user.id}>
              <div
                className="font-bold text-lg mb-2"
                data-testid={`user-${index}-name`}
              >
                {user.name}
              </div>
              <div className="text-sm font-light">
                <span className="font-bold">Email:</span> {user.email}
              </div>
              <div className="text-sm font-light">
                <span className="font-bold">Username:</span> {user.username}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
