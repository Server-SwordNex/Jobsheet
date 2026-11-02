import whatsappService from "../whatsapp/whatsappService.js";
import { config } from "../config/envConfig.js";

async function runTests() {
  console.log("🚀 Starting WhatsApp service tests...");
  console.log(`🔧 Current Provider: ${config.whatsappProvider}\n`);

  const recipient = "+919876543210";

  const executeTest = async (name, fn) => {
    console.log(`\n--- ${name} ---`);
    try {
      await fn();
      console.log(`✅ ${name} completed`);
    } catch (err) {
      console.error(`❌ ${name} failed with error:`, err.message || err);
    }
  };

  // Test 0: HELLO_WORLD
  await executeTest("Test 0: HELLO_WORLD", () => 
    whatsappService({
      to: recipient,
      type: "HELLO_WORLD"
    })
  );

  // Test 1: REGISTER_VERIFICATION (OTP)
  await executeTest("Test 1: REGISTER_VERIFICATION", () => 
    whatsappService({
      to: recipient,
      type: "REGISTER_VERIFICATION",
      data: { name: "Rajesh Kumar", otp: "554433" }
    })
  );

  // Test 2: WELCOME_MESSAGE
  await executeTest("Test 2: WELCOME_MESSAGE", () => 
    whatsappService({
      to: recipient,
      type: "WELCOME_MESSAGE",
      data: { name: "Rajesh Kumar" }
    })
  );

  // Test 3: JOBSHEET_CREATED
  await executeTest("Test 3: JOBSHEET_CREATED", () => 
    whatsappService({
      to: recipient,
      type: "JOBSHEET_CREATED",
      data: {
        customerName: "Alice Smith",
        jobsheetNo: "JS-2026-9912",
        device: "Samsung Galaxy S24 Ultra",
        status: "initiated"
      }
    })
  );

  // Test 4: JOBSHEET_STATUS_UPDATE
  await executeTest("Test 4: JOBSHEET_STATUS_UPDATE", () => 
    whatsappService({
      to: recipient,
      type: "JOBSHEET_STATUS_UPDATE",
      data: {
        customerName: "Alice Smith",
        jobsheetNo: "JS-2026-9912",
        status: "in-progress"
      }
    })
  );

  // Test 5: SUPPORT_TICKET_ALERT
  await executeTest("Test 5: SUPPORT_TICKET_ALERT", () => 
    whatsappService({
      to: recipient,
      type: "SUPPORT_TICKET_ALERT",
      data: {
        ticketId: "TKT-4412",
        subject: "Cannot download invoice PDF",
        status: "Open"
      }
    })
  );

  // Test 6: Custom free-form Text Message
  await executeTest("Test 6: Free-form Text Message", () => 
    whatsappService({
      to: recipient,
      customText: "Hello! This is a direct custom text message update from SwordNex."
    })
  );

  // Test 7: Media Message
  await executeTest("Test 7: Media Message", () => 
    whatsappService({
      to: recipient,
      media: {
        type: "document",
        link: "https://swordnex.com/docs/invoice.pdf",
        filename: "invoice.pdf",
        caption: "Your jobsheet invoice"
      }
    })
  );

  // Test 8: JOBSHEET_JOB_CREATED
  await executeTest("Test 8: JOBSHEET_JOB_CREATED", () => 
    whatsappService({
      to: recipient,
      type: "JOBSHEET_JOB_CREATED",
      data: {
        customer_name: "Rajesh Kumar",
        filename: "Jobsheet-JS-2026-9912.pdf"
      }
    })
  );

  // Test 9: JOBSHEET_COMPLETED
  await executeTest("Test 9: JOBSHEET_COMPLETED", () => 
    whatsappService({
      to: recipient,
      type: "JOBSHEET_COMPLETED",
      data: {
        customer_name: "Rajesh Kumar",
        jobsheet_no: "JS-2026-9912",
        device_name: "Samsung Galaxy S24 Ultra"
      }
    })
  );

  // Test 10: BILL_REMAINDER
  await executeTest("Test 10: BILL_REMAINDER", () => 
    whatsappService({
      to: recipient,
      type: "BILL_REMAINDER",
      data: {
        customer_name: "Rajesh Kumar",
        plan_name: "Premium",
        expiry_date: "14 Jun 2026",
        days_left: 3,
        software_name: "SwordNex Jobsheet"
      }
    })
  );

  // Test 11: BILL_EXPIRED
  await executeTest("Test 11: BILL_EXPIRED", () => 
    whatsappService({
      to: recipient,
      type: "BILL_EXPIRED",
      data: {
        customer_name: "Rajesh Kumar",
        plan_name: "Premium",
        expiry_date: "11 Jun 2026",
        software_name: "SwordNex Jobsheet"
      }
    })
  );

  console.log("\n🏁 All tests run finished!");
}

runTests();
