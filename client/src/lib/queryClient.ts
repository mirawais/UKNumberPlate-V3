import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "../config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const json = await res.json();
      throw new Error(json.message || res.statusText);
    } catch (e) {
      // If JSON parsing fails, fallback to status text
      throw new Error(res.statusText || `HTTP ${res.status}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Only add API_BASE_URL if it's not empty and url is not already absolute
  const fullUrl = url.startsWith('http') || !API_BASE_URL ? url : `${API_BASE_URL}${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle array query keys properly
    let url = queryKey[0] as string;
    
    // Only add API_BASE_URL if it's not empty and url is not already absolute
    if (!url.startsWith('http') && API_BASE_URL) {
      url = `${API_BASE_URL}${url}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 401
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
