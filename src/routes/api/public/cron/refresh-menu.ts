import { createFileRoute } from "@tanstack/react-router";
import { fetchAndCache } from "@/lib/menu.functions";

export const Route = createFileRoute("/api/public/cron/refresh-menu")({
  server: {
    handlers: {
      POST: async () => {
        const result = await fetchAndCache();
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
      GET: async () => {
        const result = await fetchAndCache();
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});
