import { createFileRoute } from "@tanstack/react-router";
import { EstavoSuperadmin } from "@/components/estavo-superadmin";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estavo Superadmin Portal" },
      { name: "description", content: "Estavo portfolio operations, estate health, billing and platform administration." },
      { property: "og:title", content: "Estavo Superadmin Portal" },
      { property: "og:description", content: "Estavo portfolio operations, estate health, billing and platform administration." },
    ],
  }),
  component: Index,
});

function Index() {
  return <EstavoSuperadmin />;
}
