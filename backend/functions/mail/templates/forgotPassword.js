// utils/mail/templates/forgotPasswordTemplate.js

const forgotPasswordTemplate = ({
  name = "User",
  otp,
}) => {
  return `

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="
    background:#f1f5f9;
    padding:20px 10px;
    font-family:
      Arial,
      sans-serif;
  "
>

  <tr>
    <td align="center">

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          max-width:600px;
          background:#ffffff;
          border-radius:20px;
          overflow:hidden;
          box-shadow:
            0 10px 35px
            rgba(0,0,0,0.08);
        "
      >

        <!-- HEADER -->

        <tr>
          <td
            align="center"
            style="
              background:
                linear-gradient(
                  135deg,
                  #0f172a,
                  #1e293b
                );

              padding:
                45px 20px;
            "
          >

            <h1 style="
              color:white;
              margin:0;
              font-size:32px;
              font-weight:700;
            ">
              JobSheet Management
            </h1>

            <p style="
              color:#cbd5e1;
              margin-top:12px;
              font-size:15px;
              line-height:1.6;
            ">
              Secure Account Verification
            </p>

          </td>
        </tr>

        <!-- BODY -->

        <tr>
          <td style="
            padding:
              45px 30px;
            text-align:center;
          ">

            <h2 style="
              margin-top:0;
              color:#0f172a;
              font-size:28px;
            ">
              Password Reset Request
            </h2>

            <p style="
              color:#475569;
              font-size:16px;
              line-height:1.8;
              margin-top:18px;
            ">
              Hello
              <strong>
                ${name}
              </strong>,
            </p>

            <p style="
              color:#475569;
              font-size:16px;
              line-height:1.8;
              margin-top:10px;
            ">
              We received a request to reset
              the password for your JobSheet
              account.
            </p>

            <p style="
              color:#475569;
              font-size:16px;
              line-height:1.8;
              margin-top:10px;
            ">
              Please use the verification code
              below to continue the password
              reset process securely.
            </p>

            <!-- OTP BOX -->

            <div style="
              margin-top:35px;
              margin-bottom:35px;
            ">

              <span style="
                display:inline-block;
                background:#eff6ff;
                border:
                  2px dashed #2563eb;

                border-radius:18px;

                padding:
                  18px 35px;

                font-size:34px;
                font-weight:700;

                letter-spacing:10px;

                color:#2563eb;

                word-break:break-word;
              ">
                ${otp}
              </span>

            </div>

            <p style="
              color:#64748b;
              font-size:14px;
              line-height:1.7;
            ">
              This verification code will expire
              in
              <strong>
                10 minutes
              </strong>.
            </p>

            <p style="
              color:#64748b;
              font-size:14px;
              line-height:1.7;
              margin-top:8px;
            ">
              If you did not request this,
              you can safely ignore this email.
              No changes will be made to your
              account.
            </p>

          </td>
        </tr>

        <!-- FOOTER -->

        <tr>
          <td style="
            background:#f8fafc;
            padding:25px;
            text-align:center;
          ">

            <p style="
              margin:0;
              color:#64748b;
              font-size:13px;
              line-height:1.7;
            ">
              Never share your verification code
              or account credentials with anyone.
            </p>

            <p style="
              margin-top:10px;
              color:#94a3b8;
              font-size:12px;
            ">
              © 2026 JobSheet Management.
              All rights reserved.
            </p>

          </td>
        </tr>

      </table>

    </td>
  </tr>

</table>
`;
};

export default forgotPasswordTemplate;