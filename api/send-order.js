// Zoe-Life Natural Linen - Vercel email function
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const {
    BREVO_API_KEY,
    BREVO_FROM_EMAIL,
    BREVO_FROM_NAME
  } = process.env;

  if (!BREVO_API_KEY || !BREVO_FROM_EMAIL) {
    return res.status(500).json({
      error: "Email is not configured in Vercel."
    });
  }

  const body = req.body || {};
  const client = body.client || {};

  if (
    !client.name ||
    !client.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)
  ) {
    return res.status(400).json({
      error: "A valid client name and email are required."
    });
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    !body.invoiceHtml
  ) {
    return res.status(400).json({
      error: "The order must contain at least one item."
    });
  }

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  const invoiceNo = escapeHtml(
    body.invoiceNumber || "Zoe-Life order"
  );

  const sender = {
    email: BREVO_FROM_EMAIL,
    name: BREVO_FROM_NAME || "Zoe-Life Natural Linen"
  };

  const common = {
    sender,
    replyTo: {
      email: BREVO_FROM_EMAIL,
      name: sender.name
    }
  };

  const clientEmail = {
    ...common,
    to: [{
      email: client.email,
      name: escapeHtml(client.name)
    }],
    subject: `Your Zoe-Life Natural Linen invoice - ${invoiceNo}`,
    htmlContent: body.invoiceHtml
  };

  const itemLines = body.items.map((item) =>
    `${escapeHtml(item.product)} | Colour: ${escapeHtml(item.color)} | Qty: ${Number(item.quantity) || 0} | Unit: R${Number(item.unitPrice || 0).toFixed(2)} | Total: R${Number(item.lineTotal || 0).toFixed(2)}`
  ).join("\n");

  const notificationHtml = `
    <div style="font-family:Arial,sans-serif;color:#2b241e;max-width:700px;margin:auto;padding:24px">
      <p style="font-size:11px;letter-spacing:3px;color:#9b7654">
        ZOE-LIFE · NEW ORDER
      </p>

      <h2 style="font-family:Georgia,serif;font-weight:400">
        New order received
      </h2>

      <p><b>Reference:</b> ${invoiceNo}</p>

      <h3>Client</h3>
      <p>
        ${escapeHtml(client.name)}<br>
        ${escapeHtml(client.business)}<br>
        ${escapeHtml(client.phone)}<br>
        ${escapeHtml(client.email)}
      </p>

      <h3>Order items</h3>
      <pre style="white-space:pre-wrap;font:13px/1.7 Arial">${itemLines}</pre>

      <p>
        <b>Original / quoted price:</b>
        R${Number(body.originalPrice || 0).toFixed(2)}<br>

        <b>Discount:</b>
        R${Number(body.discount || 0).toFixed(2)}
        (${Number(body.discountPercent || 0).toFixed(2)}%)<br>

        <b>Final charged amount:</b>
        R${Number(body.total || 0).toFixed(2)}
      </p>

      <p>
        <b>Agent:</b> ${escapeHtml(body.agent)}<br>
        <b>Invoice date:</b> ${escapeHtml(body.invoiceDate)}<br>
        <b>Due date:</b> ${escapeHtml(body.dueDate)}
      </p>

      <p>
        <b>Notes:</b><br>
        ${escapeHtml(body.notes).replace(/\n/g, "<br>")}
      </p>

      <hr style="border:0;border-top:1px solid #e8dfd4;margin:24px 0">

      <p style="color:#897968;font-size:12px">
        The client invoice is being sent separately to
        ${escapeHtml(client.email)}.
      </p>
    </div>
  `;

  const notifyEmail = {
    ...common,
    to: [{
      email: "comfort@zoelife.co.za",
      name: "Zoe-Life Orders"
    }],
    subject: `New order ${invoiceNo} - ${escapeHtml(client.name)}`,
    htmlContent: notificationHtml
  };

  async function send(payload) {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": BREVO_API_KEY,
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Brevo returned ${response.status}`
      );
    }

    return data;
  }

  try {
    const clientResult = await send(clientEmail);

    try {
      const notifyResult = await send(notifyEmail);

      return res.status(200).json({
        ok: true,
        clientMessageId: clientResult.messageId,
        notificationMessageId: notifyResult.messageId
      });

    } catch (notifyError) {
      return res.status(502).json({
        error: `The client invoice was sent, but the Zoe-Life notification failed: ${notifyError.message}`
      });
    }

  } catch (error) {
    return res.status(502).json({
      error: `Brevo could not send the invoice: ${error.message}`
    });
  }
};