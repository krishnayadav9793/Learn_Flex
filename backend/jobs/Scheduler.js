import cron from "node-cron";
import { generateDailyChallenge } from "./GenerateDailyquestion.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily challenge cron...");
  await generateDailyChallenge();
},
{
  timezone: "Asia/Kolkata"
});