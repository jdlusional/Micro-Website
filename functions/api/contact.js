// POST /api/contact
// Receives a contact submission from the form on contact.html
// and stores it in the D1 database bound as env.DB.
//
// Expects JSON:
//   { first_name, last_name, email, phone, location, purpose,
//     urgency, referral, company_website }
//
// company_website is the honeypot. People never see it, so if it has
// any value the submission is treated as a bot and silently accepted
// without being stored.

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch (e) {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: pretend success, store nothing.
  if (data.company_website && String(data.company_website).trim() !== "") {
    return json({ ok: true }, 200);
  }

  const first_name = clean(data.first_name);
  const last_name = clean(data.last_name);
  const email = clean(data.email).toLowerCase();
  const phone = clean(data.phone);
  const location = clean(data.location);
  const purpose = clean(data.purpose);
  const urgency = clean(data.urgency);
  const referral = clean(data.referral);

  // Server side validation, mirroring the client.
  if (!first_name || !last_name) {
    return json({ error: "Please enter your first and last name." }, 400);
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return json({ error: "Please enter a valid email." }, 400);
  }
  if (!location) {
    return json({ error: "Please choose your location." }, 400);
  }
  if (!purpose) {
    return json({ error: "Please enter a purpose for contact." }, 400);
  }
  const urgencyAllowed = ["Immediate", "Moderate", "None"];
  if (urgencyAllowed.indexOf(urgency) === -1) {
    return json({ error: "Please choose an urgency." }, 400);
  }
  if (!referral) {
    return json({ error: "Please tell us how you heard about us." }, 400);
  }

  const created_at = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO contacts
        (first_name, last_name, email, phone, location, purpose, urgency, referral, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(first_name, last_name, email, phone, location, purpose, urgency, referral, created_at)
      .run();
  } catch (e) {
    return json({ error: "Could not send your message. Please try again." }, 500);
  }

  return json({ ok: true }, 200);
}

function clean(v) {
  return (v === undefined || v === null) ? "" : String(v).trim();
}

function json(obj, statusCode) {
  return new Response(JSON.stringify(obj), {
    status: statusCode,
    headers: { "Content-Type": "application/json" }
  });
}
