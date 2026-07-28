import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { Provider } from "@/lib/providers";
import { createRestProvider } from "@/lib/providers/rest";
import { router } from "@/router";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const provider = createRestProvider();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="cms-theme">
        <Provider provider={provider}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
