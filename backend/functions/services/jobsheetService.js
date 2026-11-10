import { PDFDocument } from "pdf-lib";
import { FieldValue } from "firebase-admin/firestore";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { jobsheetsCollections, techniciansCollections, usersCollections } from "../config/dbCollection.js";
import { bucket } from "../config/firebaseTenantConfig.js";
import JobsheetModel from "../models/jobsheetModel.js";
import { assignJobsheetToTechnician } from "./technicianService.js";
import whatsappService from "../whatsapp/whatsappService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const MAX_PDF_SIZE = 1048576;

async function compressPdf(buffer) {
  if (buffer.length <= MAX_PDF_SIZE) return buffer;

  let pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  let compressed = await pdfDoc.save({ useObjectStreams: true });
  if (compressed.length <= MAX_PDF_SIZE) return Buffer.from(compressed);

  let scale = 0.85;
  while (compressed.length > MAX_PDF_SIZE && scale >= 0.3) {
    const newPdf = await PDFDocument.create();

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const originalPage = pdfDoc.getPage(i);
      const { width, height } = originalPage.getSize();
      const embedded = await newPdf.embedPage(originalPage, {
        width: width * scale,
        height: height * scale,
      });
      const page = newPdf.addPage([width, height]);
      page.drawPage(embedded, { x: 0, y: 0, width, height });
    }

    compressed = await newPdf.save({ useObjectStreams: true });
    scale -= 0.15;
  }

  return Buffer.from(compressed);
}

export async function createJobsheet({ pdfBuffer, fields }) {
  const { subuserId, ...rawData } = fields;

  if (!rawData.jobsheetNo || !rawData.generatedById) {
    const error = new Error("jobsheetNo and generatedById are required");
    error.status = 400;
    throw error;
  }

  const sanitizedNo = rawData.jobsheetNo.replace(/\//g, "-");
  let storagePath = `jobsheet/${rawData.generatedById}/${sanitizedNo}.pdf`;
  if (subuserId) {
    storagePath = `jobsheet/${rawData.generatedById}/${subuserId}/${sanitizedNo}.pdf`;
  }

  const compressedBuffer = await compressPdf(pdfBuffer);

  let pdfUrl = "";
  try {
    const file = bucket.file(storagePath);
    await file.save(compressedBuffer, {
      contentType: "application/pdf",
      metadata: {
        customMetadata: {
          jobsheetNo: rawData.jobsheetNo,
          generatedById: rawData.generatedById,
        },
      },
    });

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: "01-01-2099",
    });
    pdfUrl = signedUrl;
  } catch (storageErr) {
    console.warn("⚠️ Firebase Storage unavailable, saving PDF to local uploads:", storageErr.message);
    const localRelative = `uploads/${storagePath}`;
    const localFile = path.join(__dirname, "..", localRelative);
    await fs.mkdir(path.dirname(localFile), { recursive: true });
    await fs.writeFile(localFile, compressedBuffer);
    pdfUrl = `http://localhost:5000/${localRelative}`;
  }

  const model = new JobsheetModel({
    ...rawData,
    pdfLink: pdfUrl,
    pdfStoragePath: storagePath,
  });

  const docRef = await jobsheetsCollections.add(model.toFirestore());
  const jobsheetId = docRef.id;

  const userRef = usersCollections.doc(rawData.generatedById);
  const userSnap = await userRef.get();
  if (userSnap.exists) {
    await userRef.update({
      totalJobSheetsCreated: FieldValue.increment(1),
    });
  } else {
    console.warn(`User ${rawData.generatedById} not found in users collection; skipped totalJobSheetsCreated increment.`);
  }

  let resolvedTechnicianId = rawData.technicianId;

  if (!resolvedTechnicianId && rawData.technician) {
    const techSnap = await techniciansCollections
      .where("name", "==", rawData.technician)
      .where("technicianOf", "==", rawData.generatedById)
      .get();

    if (!techSnap.empty) {
      resolvedTechnicianId = techSnap.docs[0].id;
    }
  }

  if (resolvedTechnicianId) {
    await assignJobsheetToTechnician(resolvedTechnicianId, jobsheetId, rawData.jobsheetNo);
  }

  // Send WhatsApp message to the customer once after jobsheet created
  if (rawData.mobile) {
    try {
      await whatsappService({
        to: rawData.mobile,
        type: "JOBSHEET_JOB_CREATED",
        data: {
          customer_name: rawData.customer || "Customer",
          jobsheet_no: rawData.jobsheetNo || "JS-0001"
        }
      });
      console.log(`WhatsApp message sent successfully for jobsheet ${rawData.jobsheetNo}`);
    } catch (whatsappErr) {
      console.error("Failed to send WhatsApp message after jobsheet creation:", whatsappErr);
    }
  }

  return { message: "Jobsheet created successfully", jobsheetId };
}

export async function getJobsheetsByGeneratedById(generatedById) {
  if (!generatedById) {
    const error = new Error("generatedById is required");
    error.status = 400;
    throw error;
  }

  const snapshot = await jobsheetsCollections
    .where("generatedById", "==", generatedById)
    .get();

  const jobsheets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  jobsheets.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });

  return jobsheets;
}

export async function updateJobsheetStatus(jobsheetId, status) {
  if (!jobsheetId || !status) {
    const error = new Error("jobsheetId and status are required");
    error.status = 400;
    throw error;
  }

  const validStatuses = ["initiated", "in-progress", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    error.status = 400;
    throw error;
  }

  const docRef = jobsheetsCollections.doc(jobsheetId);
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("Jobsheet not found");
    error.status = 404;
    throw error;
  }

  const jobsheetData = doc.data() || {};

  await docRef.update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Send WhatsApp message once status is updated to completed
  if (status === "completed" && jobsheetData.mobile) {
    try {
      await whatsappService({
        to: jobsheetData.mobile,
        type: "JOBSHEET_COMPLETED",
        data: {
          customer_name: jobsheetData.customer || "Customer",
          jobsheet_no: jobsheetData.jobsheetNo || "JS-0001",
          device_name: jobsheetData.productName || "Device"
        }
      });
      console.log(`WhatsApp message sent successfully for completed jobsheet ${jobsheetData.jobsheetNo}`);
    } catch (whatsappErr) {
      console.error("Failed to send WhatsApp message for completed jobsheet:", whatsappErr);
    }
  }

  return { message: "Jobsheet status updated successfully", status };
}

export async function searchJobsheet({ jobId, mobileNumber, name }) {
  if (!jobId || !mobileNumber) {
    const error = new Error("Job ID and Mobile Number are required");
    error.status = 400;
    throw error;
  }

  const snapshot = await jobsheetsCollections
    .where("jobsheetNo", "==", jobId)
    .get();

  if (snapshot.empty) {
    const error = new Error("Jobsheet not found");
    error.status = 404;
    throw error;
  }

  const cleanSearchMobile = mobileNumber.replace(/\D/g, "");

  const matchingDoc = snapshot.docs.find((doc) => {
    const data = doc.data();
    const cleanDbMobile = (data.mobile || "").replace(/\D/g, "");
    
    const matchesMobile = cleanDbMobile === cleanSearchMobile || 
                          cleanDbMobile.endsWith(cleanSearchMobile) || 
                          cleanSearchMobile.endsWith(cleanDbMobile);

    if (!matchesMobile) return false;

    if (name) {
      const cleanDbName = (data.customer || "").toLowerCase().trim();
      const cleanSearchName = name.toLowerCase().trim();
      if (cleanSearchName && !cleanDbName.includes(cleanSearchName)) {
        return false;
      }
    }

    return true;
  });

  if (!matchingDoc) {
    const error = new Error("No matching jobsheet found with this mobile number");
    error.status = 404;
    throw error;
  }

  return { id: matchingDoc.id, ...matchingDoc.data() };
}

