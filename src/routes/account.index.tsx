import { createFileRoute, Navigate } from "@tanstack/react-router";
import { requireAuthBeforeLoad } from "@/features/auth/require-auth";

export const Route = createFileRoute("/account/")({
  beforeLoad: requireAuthBeforeLoad,
  component: () => <Navigate to="/account/profile" replace />,
});