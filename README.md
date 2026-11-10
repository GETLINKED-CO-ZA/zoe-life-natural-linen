# Zoe-Life Order & Invoice Studio

A small luxury-styled order entry page for Zoe-Life Natural Linen, designed for GitHub + Vercel with Brevo transactional email.

## Included
- `index.html` — responsive agent-facing order and invoice interface; Zoe-Life logo is embedded.
- `api/send-order.js` — Vercel serverless function. Keeps the Brevo API key on the server.
- `vercel.json` — Vercel function configuration.

## Catalogue and pricing
The nine products and displayed prices were transcribed from the public Zoe-Life online shop on 10 November 2026. Product prices can be edited by the agent on each order. The live website does not expose a definitive colour list in the accessible product text; colour is therefore an editable selector with neutral suggestions and a custom/specify option. Confirm colour availability with Zoe-Life before sending.

## Deploy to Vercel
1. Upload the contents of this folder to a GitHub repository (the `api` folder must remain at the repository root).
2. Import that repository into Vercel.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `BREVO_API_KEY` = your Brevo API key (keep this secret; never put it in `index.html`).
   - `BREVO_FROM_EMAIL` = a sender address verified/authenticated in Brevo.
   - `BREVO_FROM_NAME` = `Zoe-Life Natural Linen` (optional).
4. Redeploy after adding environment variables.
5. Open the deployed URL and test with an internal/test client email first.

## Email behaviour
- Client invoice is sent to the email entered on the form.
- New-order notification is sent to `comfort@zoelife.co.za`.
- Both emails are sent through Brevo's `POST /v3/smtp/email` endpoint.
- The invoice is delivered as a beautifully formatted HTML email. The page also offers Print / Save PDF for a locally saved PDF copy.
- Brevo sending requires the sender address to be verified in your Brevo account and the account to be enabled for transactional email.

## Important operational notes
- This is an agent-assisted order form, not a payment gateway or stock-management system.
- The form does not add VAT automatically. Confirm whether prices are VAT-inclusive and add the appropriate business wording before using it for tax invoices.
- No payment/banking details are invented. Add approved payment instructions in the Notes field or customise the invoice template.
- The public catalogue describes made-to-order pieces with an estimated lead time of 21–30 business days. Confirm this with the client for each order.
- The public website notes that colours may vary; the agent should confirm actual available colours and specifications.
- Before production use, test successful sending, invalid email handling, and Brevo/Vercel error messages.
