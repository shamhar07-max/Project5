"use client";
import { ActionError } from "../_app/action-error";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ActionError error={error} reset={reset} home="/admin" />;
}
