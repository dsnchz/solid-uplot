import { A } from "@solidjs/router";

export const NotFound = () => {
  return (
    <div class="h-full flex flex-col items-center justify-center">
      <h1 class="text-5xl mb-3">Page Not Found</h1>
      <p class="mb-4">We cannot find the page you are looking for.</p>
      <A
        href="/"
        class="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
      >
        Home
      </A>
    </div>
  );
};
