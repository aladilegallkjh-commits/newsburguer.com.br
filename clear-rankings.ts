import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({
    url: "file:./local.db",
  });

  try {
    const rankingsResult = await client.execute("SELECT id, customerId, period, position, prizeWon FROM customerRankings");
    console.log("All rankings:");
    console.table(rankingsResult.rows);

    await client.execute("DELETE FROM customerRankings");
    console.log("Cleared all rankings.");
  } catch (e: any) {
    console.error("Error with rankings:", e.message);
  }
}

main().catch(console.error);
