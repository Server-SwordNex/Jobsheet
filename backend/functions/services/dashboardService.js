import { jobsheetsCollections, techniciansCollections, usersCollections, subUsersCollection } from "../config/dbCollection.js";

export async function getDashboardData(uid, subuserId) {
  if (!uid) {
    const error = new Error("uid is required");
    error.status = 400;
    throw error;
  }

  let user;
  let ownerId = uid; // whose technicians / plan apply (the parent admin for a sub-user)
  const userDoc = await usersCollections.doc(uid).get();
  if (!userDoc.exists) {
    const subDoc = uid === "superadmin" ? null : await subUsersCollection.doc(uid).get();
    if (subDoc?.exists) {
      // a sub-user sees their own jobsheets, under the parent business's plan
      const sub = subDoc.data();
      ownerId = sub.parentUserId;
      const parentDoc = ownerId ? await usersCollections.doc(ownerId).get() : null;
      const parent = parentDoc?.exists ? parentDoc.data() : {};
      user = {
        id: uid,
        uid,
        role: sub.role || "team",
        username: sub.username || sub.subUserName,
        email: sub.email,
        companyName: parent.companyName || sub.companyName,
        plan: parent.plan,
        planPrice: parent.planPrice,
        billingType: parent.billingType,
        jobSheetLimit: parent.jobSheetLimit,
        staffLimit: parent.staffLimit,
        currentStaffs: parent.currentStaffs,
        planStartDate: parent.planStartDate,
        planEndDate: parent.planEndDate,
        subscriptionStatus: parent.subscriptionStatus,
        totalJobSheetsCreated: sub.jobSheetGenerated || 0,
      };
    } else if (uid === "superadmin") {
      user = {
        id: "superadmin",
        uid: "superadmin",
        companyName: "Super Admin",
        email: process.env.SUPERADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || "",
        username: "superadmin",
        role: "superadmin",
        plan: "unlimited",
      };
    } else {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
  } else {
    user = { id: userDoc.id, ...userDoc.data() };
  }

  const jobsheetsSnap = await jobsheetsCollections
    .where("generatedById", "==", uid)
    .get();

  const techniciansSnap = await techniciansCollections
    .where("technicianOf", "==", ownerId)
    .get();

  const allJobsheets = jobsheetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const allTechnicians = techniciansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const statusCounts = { initiated: 0, "in-progress": 0, completed: 0, cancelled: 0 };
  for (const js of allJobsheets) {
    const s = js.status || "initiated";
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  }

  const totalRevenue = allJobsheets.reduce((sum, js) => sum + (Number(js.total) || 0), 0);
  const totalDiscount = allJobsheets.reduce((sum, js) => sum + (Number(js.discount) || 0), 0);
  const totalAdditionalCharges = allJobsheets.reduce((sum, js) => sum + (Number(js.additionalCharges) || 0), 0);

  const recentJobsheets = [...allJobsheets]
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  const monthlyTrend = getMonthlyTrend(allJobsheets);

  const planUsage = {
    totalJobSheetsCreated: user.totalJobSheetsCreated || 0,
    jobSheetLimit: user.jobSheetLimit || 0,
    currentStaffs: user.currentStaffs || 0,
    staffLimit: user.staffLimit || 0,
    plan: user.plan || "free",
    planPrice: user.planPrice || 0,
    billingType: user.billingType || "monthly",
    planStartDate: user.planStartDate || null,
    planEndDate: user.planEndDate || null,
    subscriptionStatus: user.subscriptionStatus || "ACTIVE",
  };

  const techStats = {
    totalTechnicians: allTechnicians.length,
    totalAssignedJobs: allTechnicians.reduce((sum, t) => sum + (Number(t.totalAssignedJobs) || 0), 0),
    recentTechnicians: [...allTechnicians]
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      })
      .slice(0, 5),
  };

  return {
    user: {
      uid: user.uid || user.id,
      companyName: user.companyName,
      email: user.email,
      username: user.username,
      role: user.role,
      plan: user.plan,
    },
    jobsheets: {
      total: allJobsheets.length,
      statusCounts,
      totalRevenue,
      totalDiscount,
      totalAdditionalCharges,
      recent: recentJobsheets,
      monthlyTrend,
    },
    technicians: techStats,
    planUsage,
    subuserId: subuserId || null,
  };
}

function getMonthlyTrend(jobsheets) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleString("default", { month: "short", year: "numeric" });

    const count = jobsheets.filter(js => {
      const t = js.createdAt?.toDate?.();
      if (!t) return false;
      return t.getFullYear() === year && t.getMonth() === month;
    }).length;

    const revenue = jobsheets.filter(js => {
      const t = js.createdAt?.toDate?.();
      if (!t) return false;
      return t.getFullYear() === year && t.getMonth() === month;
    }).reduce((sum, js) => sum + (Number(js.total) || 0), 0);

    months.push({ label, count, revenue });
  }

  return months;
}
