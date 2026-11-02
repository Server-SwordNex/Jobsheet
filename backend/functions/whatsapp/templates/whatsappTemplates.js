/**
 * WhatsApp message template registry.
 * Decouples business logic text/media structure from sending provider.
 * Returns both plain text fallbacks (useful for Console/Twilio) and
 * Meta Cloud API formatted JSON structures.
 */

export const whatsappTemplates = {
  /* =========================================================================
     0. HELLO WORLD TEST
     ========================================================================= */
  HELLO_WORLD: (data) => {
    return {
      textFallback: "Hello World! This is a test message from your WhatsApp Cloud API integration.",
      metaTemplate: {
        name: "hello_world",
        languageCode: "en_US",
        components: []
      }
    };
  },

  /* =========================================================================
     1. OTP / REGISTER VERIFICATION
     ========================================================================= */
  REGISTER_VERIFICATION: (data) => {
    const otp = data.otp || "";
    const name = data.name || "Customer";

    return {
      textFallback: `Hello ${name}, your verification OTP for SwordNex JobSheet is ${otp}. It is valid for 5 minutes. Please do not share this code with anyone.`,
      metaTemplate: {
        name: "otp_verification",
        languageCode: "en_US",
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: name },
              { type: "text", text: otp }
            ]
          }
        ]
      }
    };
  },

  /* =========================================================================
     2. WELCOME MESSAGE
     ========================================================================= */
  WELCOME_MESSAGE: (data) => {
    const name = data.name || "User";

    return {
      textFallback: `Hello ${name}, welcome to SwordNex JobSheet! We're excited to help you streamline your jobsheet management. Let us know if you need any assistance getting started.`,
      metaTemplate: {
        name: "welcome_message",
        languageCode: "en_US",
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: name }
            ]
          }
        ]
      }
    };
  },

  /* =========================================================================
     3. JOBSHEET CREATED
     ========================================================================= */
  // JOBSHEET_CREATED: (data) => {
  //   const customerName = data.customerName || "Customer";
  //   const jobsheetNo = data.jobsheetNo || "N/A";
  //   const websiteUrl = data.websiteUrl || "http://localhost:5173/search";

  //   return {
  //     textFallback: `Hi ${customerName}, your jobsheet was created successfully. Here is the jobsheet no: ${jobsheetNo} and you can see the status on website which have url: ${websiteUrl}`,
  //     metaTemplate: {
  //       name: "jobsheet_created",
  //       languageCode: "en_US",
  //       components: [
  //         {
  //           type: "body",
  //           parameters: [
  //             { type: "text", text: customerName },
  //             { type: "text", text: jobsheetNo },
  //           ]
  //         }
  //       ]
  //     }
  //   };
  // },

  /* =========================================================================
     3.5. JOBSHEET JOB CREATED (NEW TEMPLATE)
     ========================================================================= */
  JOBSHEET_JOB_CREATED: (data) => {
    const customer_name = data.customer_name || "Customer";
    const jobsheet_no = data.jobsheet_no || "JS-0001";
    const device_name = data.device_name || "Device";

    return {
      textFallback: `Hi ${customer_name}, your jobsheet has been created successfully. Jobsheet No: ${jobsheet_no}`,

      metaTemplate: {
        name: "jobsheet_job_created",

        language: {
          code: "en_US"
        },

        components: [
          {
            type: "body",

            parameters: [
              {
                type: "text",
                parameter_name: "customer_name",
                text: String(customer_name)
              },
              {
                type: "text",
                parameter_name: "jobsheet_no",
                text: String(jobsheet_no)
              },
            ]
          }
        ]
      }
    };
  },

  /* =========================================================================
     4. JOBSHEET STATUS UPDATE
     ========================================================================= */
  JOBSHEET_COMPLETED: (data) => {
    const customer_name = data.customer_name || "Customer";
    const jobsheet_no = data.jobsheet_no || "JS-0001";
    const device_name = data.device_name || "Device";

    return {
      textFallback: `Hi ${customer_name}, your job has been completed successfully. Jobsheet No: ${jobsheet_no}`,

      metaTemplate: {
        name: "jobsheet_job_completed",

        language: {
          code: "en_US"
        },

        components: [
          {
            type: "body",

            parameters: [
              {
                type: "text",
                parameter_name: "customer_name",
                text: String(customer_name)
              },
              {
                type: "text",
                parameter_name: "jobsheet_no",
                text: String(jobsheet_no)
              },
              {
                type: "text",
                parameter_name: "device_name",
                text: String(device_name)
              }
            ]
          }
        ]
      }
    };
  },

  /* =========================================================================
     5. SUPPORT TICKET CREATED
     ========================================================================= */
  SUPPORT_TICKET_ALERT: (data) => {
    const ticketId = data.ticketId || "N/A";
    const subject = data.subject || "No Subject";
    const status = data.status || "Open";

    return {
      textFallback: `Support Ticket Raised! Ticket ID: ${ticketId}. Subject: "${subject}". Status: ${status}. Our team will review and reply shortly.`,
      metaTemplate: {
        name: "support_ticket_alert",
        languageCode: "en_US",
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: ticketId },
              { type: "text", text: subject },
              { type: "text", text: status }
            ]
          }
        ]
      }
    };
  },

  /* =========================================================================
     6. BILL REMAINDER & EXPIRED
     ========================================================================= */
  BILL_REMAINDER: (data) => {
    const customer_name = data.customer_name || "Customer";
    const plan_name = data.plan_name || "Standard";
    const expiry_date = data.expiry_date || "";
    const days_left = data.days_left || "3";
    const software_name = data.software_name || "SwordNex Jobsheet";

    return {
      textFallback: `Dear ${customer_name}, your subscription for the ${plan_name} plan is expiring in ${days_left} days on ${expiry_date}. Please renew to avoid service interruption.`,
      metaTemplate: {
        name: "bill_remainder",
        language: {
          code: "en_US"
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "text",
                parameter_name: "customer_name",
                text: String(customer_name)
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                parameter_name: "plan_name",
                text: String(plan_name)
              },
              {
                type: "text",
                parameter_name: "expiry_date",
                text: String(expiry_date)
              },
              {
                type: "text",
                parameter_name: "days_left",
                text: String(days_left)
              },
              {
                type: "text",
                parameter_name: "software_name",
                text: String(software_name)
              }
            ]
          }
        ]
      }
    };
  },

  BILL_EXPIRED: (data) => {
    const customer_name = data.customer_name || "Customer";
    const plan_name = data.plan_name || "Standard";
    const expiry_date = data.expiry_date || "";
    const software_name = data.software_name || "SwordNex Jobsheet";

    return {
      textFallback: `Dear ${customer_name}, your subscription for the ${plan_name} plan has expired on ${expiry_date}. Your account has been reverted to the Free plan.`,
      metaTemplate: {
        name: "bill_expired",
        language: {
          code: "en_US"
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "text",
                parameter_name: "customer_name",
                text: String(customer_name)
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                parameter_name: "plan_name",
                text: String(plan_name)
              },
              {
                type: "text",
                parameter_name: "expiry_date",
                text: String(expiry_date)
              },
              {
                type: "text",
                parameter_name: "software_name",
                text: String(software_name)
              }
            ]
          }
        ]
      }
    };
  }
};

/**
 * Utility function to compile a template by name with given context data.
 */
export function compileTemplate(type, data) {
  const templateFn = whatsappTemplates[type];
  if (!templateFn) {
    throw new Error(`WhatsApp template type "${type}" not registered.`);
  }
  return templateFn(data);
}
