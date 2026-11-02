import sendMail from "./sendMail.js";

import welcomeTemplate from "./templates/welcomeMail.js";

import forgotPasswordTemplate
    from "./templates/forgotPassword.js";

import supportTicketTemplate
    from "./templates/supportTicket.js";

import registerVerificationTemplate
    from "./templates/registerVerification.js";

import announcementMailTemplate
    from "./templates/announcement.js";

import subscriptionExpiryTemplate from "./templates/subscriptionExpiry.js";
import subscriptionExpiredTemplate from "./templates/subscriptionExpired.js";

export const mailService =
    async ({
        type,
        to,
        data,
    }) => {

        let subject = "";

        let html = "";

        switch (type) {

            /* =========================
               WELCOME
            ========================== */

            case "WELCOME_MAIL":

                subject =
                    "Welcome to SwordNex JobSheet";

                html =
                    welcomeTemplate({ name: data.name });

                break;

            /* =========================
               FORGOT PASSWORD
            ========================== */

            case "FORGOT_PASSWORD":

                subject =
                    "Reset Your Password";

                html =
                    forgotPasswordTemplate(data);

                break;

            /* =========================
               SUPPORT TICKET
            ========================== */

            case "SUPPORT_TICKET":

                subject =
                    "New Support Ticket Raised";

                html =
                    supportTicketTemplate(data);

                break;

            /* =========================
               REGISTER VERIFICATION
            ========================== */

            case "REGISTER_VERIFICATION":

                subject =
                    "Welcome to SwordNex JobSheet";

                html =
                    registerVerificationTemplate(
                        data
                    );

                break;

            case "ANNOUNCEMENT_MAIL":

                subject = "New Announcement";

                html = announcementMailTemplate(data);

                break;

            case "SUBSCRIPTION_EXPIRY":

                subject = "Subscription Expiry Reminder";

                html = subscriptionExpiryTemplate(data);

                break;

            case "SUBSCRIPTION_EXPIRED":

                subject = "Subscription Expired";

                html = subscriptionExpiredTemplate(data);

                break;

            default:

                throw new Error(
                    "Invalid mail type"
                );
        }

        /* =========================
           SEND MAIL
        ========================== */

        await sendMail({

            to,

            subject,

            html,

        });
    };