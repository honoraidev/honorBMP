export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { hydrateStoreFromDb } = await import("@/lib/store");
    await hydrateStoreFromDb();
  }
}
