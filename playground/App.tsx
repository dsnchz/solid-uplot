import { createSignal } from "solid-js";

export const App = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div id="app" class="h-screen w-screen bg-gray-900">
      <div class="text-white text-2xl font-bold">Playground App</div>
      <div class="text-white text-2xl font-bold">Count: {count()}</div>
      <button
        onClick={() => {
          setCount((prev) => prev + 1);
        }}
      >
        Increment Count
      </button>
    </div>
  );
};
