const subscriptionExpiryTemplate = ({
  name = "User",
  plan = "Standard",
  expiryDate = "",
  daysLeft = 7,
}) => {
  return `
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding:20px 10px; font-family: Arial, sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow: 0 10px 35px rgba(0,0,0,0.08);">
        <!-- HEADER -->
        <tr>
          <td align="center" style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 45px 20px;">
            <h1 style="color:white; margin:0; font-size:30px; font-weight:700;">Subscription Expiry Alert</h1>
            <p style="color:#ffe4e6; margin-top:12px; font-size:15px; line-height:1.6;">Action Required: Renew Your Plan</p>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding: 45px 30px; text-align:center;">
            <h2 style="margin-top:0; color:#0f172a; font-size:24px;">Hi ${name},</h2>
            <p style="color:#475569; font-size:16px; line-height:1.8; margin-top:18px;">
              Your <strong>${plan}</strong> plan is expiring in <strong>${daysLeft} days</strong> on <strong>${expiryDate}</strong>.
            </p>
            <p style="color:#475569; font-size:16px; line-height:1.8; margin-top:10px;">
              To prevent any interruption to your jobsheet services, please renew your subscription before it expires.
            </p>
            <div style="margin-top:35px; margin-bottom:35px;">
              <a href="https://yourdomain.com/dashboard/billing" style="display:inline-block; background:#be123c; color:white; text-decoration:none; padding: 15px 32px; border-radius:12px; font-size:16px; font-weight:600;">Renew Subscription Now</a>
            </div>
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc; padding:25px; text-align:center;">
            <p style="margin:0; color:#64748b; font-size:13px; line-height:1.7;">Thank you for choosing JobSheet Management.</p>
            <p style="margin-top:10px; color:#94a3b8; font-size:12px;">© 2026 JobSheet Management. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
};

export default subscriptionExpiryTemplate;
