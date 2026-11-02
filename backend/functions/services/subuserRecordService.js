import { jobsheetsCollections, subUsersCollection } from "../config/dbCollection.js";

/* =========================================================================
   GET SUBUSER RECORDS + STATS
   ========================================================================= */
export const getAdminSubuserRecordsService = async (uid, subuserName = "") => {
  try {
    if (!uid) {
      const error = new Error("Admin uid is required");
      error.status = 400;
      throw error;
    }

    console.log("📊 Fetching subuser records for admin:", uid);

    /* =========================
       GET SUBUSERS
    ========================== */
    const subusersSnapshot = await subUsersCollection
      .where("parentUserId", "==", uid)
      .get();

    const subusers = subusersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ ${subusers.length} subusers found`);

    /* =========================
       GET ALL JOBSHEETS
    ========================== */
    let jobsheets = [];

    for (const subuser of subusers) {
      const jobsheetSnapshot = await jobsheetsCollections
        .where("generatedById", "==", subuser.id)
        .get();

      const subuserJobsheets = jobsheetSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        subUserName: subuser.subUserName,
      }));

      jobsheets.push(...subuserJobsheets);
    }

    /* =========================
       FILTER BY SUBUSER NAME
    ========================== */
    if (subuserName) {
      jobsheets = jobsheets.filter(
        (js) => js.subUserName === subuserName
      );
    }

    /* =========================
       CALCULATE STATS
    ========================== */
    let totalAmount = 0;

    jobsheets.forEach((js) => {
      totalAmount += Number(js.total || 0);
    });

    return {
      stats: {
        totalSubUsers: subusers.length,
        totalJobsheets: jobsheets.length,
        totalAmount,
      },
      jobsheets,
      subusers,
    };

  } catch (error) {
    console.error("❌ SUBUSER RECORDS SERVICE ERROR:", error);
    throw error;
  }
};