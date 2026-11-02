import 'dotenv/config';
import { usersCollections } from "../config/dbCollection.js";
import { getAdminSubuserRecordsService } from "../services/subuserRecordService.js";

async function runTest() {
  console.log("Starting subuser records test run...");
  const snapshot = await usersCollections.limit(1).get();
  if (snapshot.empty) {
    console.log("No users found to test with");
    return;
  }
  const adminUid = snapshot.docs[0].id;
  console.log(`Testing with Admin UID: ${adminUid}`);
  const result = await getAdminSubuserRecordsService(adminUid);
  console.log("Subuser records results:", JSON.stringify(result, null, 2));
}

runTest()
  .then(() => {
    console.log("Test execution finished successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
