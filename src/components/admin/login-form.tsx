"use client";
// Client component: useActionState for inline errors and the pending state.

import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { signIn } from "@/app/login/actions";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, action, pending] = useActionState(signIn, { error: initialError });
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="Email">
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field id="password" label="Password">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error ? (
        <p role="alert" className="text-small text-status-error max-w-none">{state.error}</p>
      ) : null}
      <div>
        <Button type="submit" pending={pending}>Sign in</Button>
      </div>
    </form>
  );
}
