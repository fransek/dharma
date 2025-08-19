import { createStore, useStore } from "dharma-react";

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchUsers = async () => {
  await sleep(500);
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  return await response.json();
};

const store = createStore(
  { users: [], loading: true } as State,
  (set) => ({
    refresh: async () => {
      set({ users: [], loading: true });
      const users = await fetchUsers();
      set({ users: users, loading: false });
    },
  }),
  {
    onAttach: async (state, set) => {
      if (state.users.length) {
        return;
      }
      const users = await fetchUsers();
      set({ users: users, loading: false });
    },
  },
);

export function Async() {
  const {
    state: { users, loading },
    actions: { refresh },
  } = useStore(store);

  return (
    <div className="flex flex-col items-start gap-4">
      {loading ? (
        <div data-testid="loading">Fetching users...</div>
      ) : (
        <>
          <button onClick={refresh}>Refresh</button>
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
