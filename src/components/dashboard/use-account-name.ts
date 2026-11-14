import { useEffect, useState } from "react";

import { authApi } from "@/lib/auth-api";
import { firstName } from "./health";

export interface AccountName {
  /** First name (or the whole name when no space separates it). */
  first: string;
  fullName: string;
  astronautId: string;
}

/**
 * The registered name of the currently authenticated user, fetched from
 * the account itself (`GET /api/auth/me`) — never hardcoded. `settled`
 * flips once the lookup has finished (or immediately when signed out),
 * so views can defer seeding text until the real name is known.
 */
export function useAccountName(): { account: AccountName | null; settled: boolean } {
  const [account, setAccount] = useState<AccountName | null>(null);
  const [settled, setSettled] = useState(() => authApi.getSession() === null);
  useEffect(() => {
    if (settled) return;
    let alive = true;
    authApi
      .me()
      .then((user) => {
        if (!alive) return;
        const full = user.fullName.trim();
        if (full)
          setAccount({
            first: firstName(full) ?? full,
            fullName: full,
            astronautId: user.astronautId.trim(),
          });
      })
      .catch(() => {
        /* offline or expired token: local fallback remains in effect */
      })
      .finally(() => {
        if (alive) setSettled(true);
      });
    return () => {
      alive = false;
    };
  }, [settled]);
  return { account, settled };
}
