import { cookies } from "next/headers";
import { getEmployee } from "./store";
import { Employee } from "./types";

const COOKIE_NAME = "demo_user_id";

export async function getCurrentEmployee(): Promise<Employee | null> {
  const store = await cookies();
  const id = store.get(COOKIE_NAME)?.value;
  if (!id) return null;
  return getEmployee(id) ?? null;
}

export async function setCurrentEmployee(id: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, id, { path: "/", httpOnly: false, sameSite: "lax" });
}

export async function clearCurrentEmployee() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const DEMO_COOKIE_NAME = COOKIE_NAME;
