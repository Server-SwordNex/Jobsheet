/* =========================================================
SUPPORT TEMPLATE
utils/mail/templates/supportTicketTemplate.js
========================================================= */

const supportTicketTemplate = ({
  ticketId,
  name,
  companyName,
  email,
  mobileNo,
  query,
}) => {
  return `

<div style="
  background:#f8fafc;
  padding:40px 15px;
  font-family:Arial,sans-serif;
">

  <div style="
    max-width:700px;
    margin:auto;
    background:white;
    border-radius:20px;
    overflow:hidden;
    border:1px solid #e2e8f0;
    box-shadow:
      0 10px 30px
      rgba(0,0,0,0.06);
  ">

    <!-- HEADER -->

    <div style="
      background:
        linear-gradient(
          135deg,
          #0f172a,
          #1e293b
        );

      padding:35px 30px;
      text-align:center;
    ">

      <h2 style="
        color:white;
        margin:0;
        font-size:30px;
      ">
        New Support Request
      </h2>

      <p style="
        color:#cbd5e1;
        margin-top:10px;
        font-size:14px;
      ">
        A new customer query has been submitted
        from JobSheet Management.
      </p>

    </div>

    <!-- BODY -->

    <div style="
      padding:35px 30px;
    ">

      <div style="
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:14px;
        padding:20px;
      ">

        <p style="
          margin:0 0 14px 0;
          color:#334155;
        ">
          <strong>
            Ticket ID:
          </strong>
          ${ticketId}
        </p>

        <p style="
          margin:0 0 14px 0;
          color:#334155;
        ">
          <strong>
            Customer Name:
          </strong>
          ${name}
        </p>

        <p style="
          margin:0 0 14px 0;
          color:#334155;
        ">
          <strong>
            Company Name:
          </strong>
          ${companyName}
        </p>

        <p style="
          margin:0 0 14px 0;
          color:#334155;
        ">
          <strong>
            Email Address:
          </strong>
          ${email}
        </p>

        <p style="
          margin:0;
          color:#334155;
        ">
          <strong>
            Mobile Number:
          </strong>
          ${mobileNo}
        </p>

      </div>

      <!-- QUERY -->

      <div style="
        margin-top:25px;
        padding:25px;
        background:#eff6ff;
        border:
          1px solid #bfdbfe;

        border-radius:14px;
      ">

        <h3 style="
          margin-top:0;
          margin-bottom:15px;
          color:#1e3a8a;
        ">
          Support Message
        </h3>

        <p style="
          margin:0;
          color:#334155;
          line-height:1.8;
          font-size:15px;
          white-space:pre-line;
        ">
          ${query}
        </p>

      </div>

    </div>

    <!-- FOOTER -->

    <div style="
      background:#f8fafc;
      padding:22px;
      text-align:center;
      border-top:
        1px solid #e2e8f0;
    ">

      <p style="
        margin:0;
        color:#64748b;
        font-size:13px;
      ">
        This email was automatically generated
        by JobSheet Management Support System.
      </p>

      <p style="
        margin-top:8px;
        color:#94a3b8;
        font-size:12px;
      ">
        © 2026 JobSheet Management.
        All rights reserved.
      </p>

    </div>

  </div>

</div>
`;
};

export default supportTicketTemplate;