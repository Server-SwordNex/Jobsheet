// utils/mail/templates/announcementMailTemplate.js

const announcementMailTemplate = ({
  name = "User",
  title = "New Announcement",
  message = "",
  type = "General",
  priority = "Normal",
  buttonText = "Open Dashboard",
  buttonLink = "#",
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
          max-width:650px;
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
                45px 25px;
            "
          >

            <h1 style="
              color:white;
              margin:0;
              font-size:32px;
              font-weight:700;
            ">
              Invoice Management
            </h1>

            <p style="
              color:#cbd5e1;
              margin-top:12px;
              font-size:15px;
              line-height:1.6;
            ">
              Important Platform Announcement
            </p>

          </td>
        </tr>

        <!-- BODY -->

        <tr>
          <td style="
            padding:
              45px 35px;
          ">

            <p style="
              color:#475569;
              font-size:16px;
              line-height:1.8;
              margin-top:0;
            ">
              Hello
              <strong>
                ${name}
              </strong>,
            </p>

            <!-- BADGES -->

            <div style="
              margin-top:20px;
              margin-bottom:20px;
            ">

              <span style="
                display:inline-block;
                background:#eff6ff;
                color:#1d4ed8;

                padding:
                  8px 14px;

                border-radius:999px;

                font-size:13px;
                font-weight:600;

                margin-right:10px;
              ">
                Type: ${type}
              </span>

              <span style="
                display:inline-block;
                background:#fef3c7;
                color:#92400e;

                padding:
                  8px 14px;

                border-radius:999px;

                font-size:13px;
                font-weight:600;
              ">
                Priority: ${priority}
              </span>

            </div>

            <!-- TITLE -->

            <h2 style="
              color:#0f172a;
              font-size:30px;
              line-height:1.4;
              margin-top:10px;
              margin-bottom:20px;
            ">
              ${title}
            </h2>

            <!-- MESSAGE -->

            <div style="
              color:#475569;
              font-size:16px;
              line-height:1.9;
              white-space:pre-line;
            ">
              ${message}
            </div>

            <!-- BUTTON -->

            <div style="
              margin-top:40px;
              text-align:center;
            ">

              <a
                href="${buttonLink}"
                style="
                  display:inline-block;
                  background:#0f172a;
                  color:white;
                  text-decoration:none;

                  padding:
                    15px 34px;

                  border-radius:12px;

                  font-size:16px;
                  font-weight:600;
                "
              >
                ${buttonText}
              </a>

            </div>

          </td>
        </tr>

        <!-- FOOTER -->

        <tr>
          <td style="
            background:#f8fafc;
            padding:25px;
            text-align:center;
            border-top:
              1px solid #e2e8f0;
          ">

            <p style="
              margin:0;
              color:#64748b;
              font-size:13px;
              line-height:1.7;
            ">
              You are receiving this email
              because you are registered with
              Invoice Management.
            </p>

            <p style="
              margin-top:10px;
              color:#94a3b8;
              font-size:12px;
            ">
              © 2026 Invoice Management.
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

export default announcementMailTemplate;