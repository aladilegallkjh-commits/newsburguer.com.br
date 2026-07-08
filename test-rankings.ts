import { getCurrentRankings } from './server/ranking';

async function test() {
  const result = await getCurrentRankings();
  console.log("Weekly:", result.weeklyRankings);
}
test();
