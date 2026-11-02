// utils/mail/templates/welcomeTemplate.js

const welcomeTemplate = ({
  name = "User",
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
              Smart Service & Workflow Management
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
              Welcome Aboard 🎉
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
              Thank you for joining
              <strong>
                JobSheet Management
              </strong>.
            </p>

            <p style="
              color:#475569;
              font-size:16px;
              line-height:1.8;
              margin-top:10px;
            ">
              Your account has been successfully
              created and your workspace is
              ready to manage daily operations
              more efficiently.
            </p>

            <!-- FEATURE BOX -->

            <div style="
              margin-top:35px;
              margin-bottom:35px;
            ">

              <div style="
                display:inline-block;
                background:#f8fafc;
                border:
                  1px solid #e2e8f0;

                border-radius:18px;

                padding:
                  25px 30px;

                text-align:left;

                max-width:420px;
              ">

                <p style="
                  margin:0;
                  color:#0f172a;
                  font-size:16px;
                  font-weight:600;
                ">
                  🚀 What you can do now:
                </p>

                <ul style="
                  margin-top:18px;
                  padding-left:20px;
                  color:#475569;
                  font-size:15px;
                  line-height:2;
                ">
                  <li>Create and manage job sheets</li>
                  <li>Track service requests & status</li>
                  <li>Manage staff and workflows</li>
                  <li>Store customer service records</li>
                  <li>Monitor business activities easily</li>
                </ul>

              </div>

            </div>

            <!-- BUTTON -->

            <a
              href="https://yourdomain.com/login"
              style="
                display:inline-block;
                background:#0f172a;
                color:white;
                text-decoration:none;

                padding:
                  15px 32px;

                border-radius:12px;

                font-size:16px;
                font-weight:600;
              "
            >
              Access Dashboard
            </a>

            <p style="
              color:#64748b;
              font-size:14px;
              line-height:1.7;
              margin-top:30px;
            ">
              If you need any assistance,
              our support team is always
              ready to help you.
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
              Thank you for choosing
              JobSheet Management.
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

export default welcomeTemplate;