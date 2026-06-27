// POST /api/subscribe
// Receives a newsletter signup from the form on newsletters.html
// and stores it in the D1 database bound as env.DB.
//
// Expects JSON:
//   { newsletter, first_name, last_name, email, organization, referral, company_website }
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

  const newsletter = clean(data.newsletter);
  const first_name = clean(data.first_name);
  const last_name = clean(data.last_name);
  const email = clean(data.email).toLowerCase();
  const organization = clean(data.organization);
  const referral = clean(data.referral);

  // Server side validation, mirroring the client.
  const allowed = ["House Rules", "Fellowships4Free"];
  if (!allowed.includes(newsletter)) {
    return json({ error: "Please choose a newsletter." }, 400);
  }
  if (!first_name || !last_name) {
    return json({ error: "Please enter your first and last name." }, 400);
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return json({ error: "Please enter a valid email." }, 400);
  }

  const created_at = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO subscribers
        (newsletter, first_name, last_name, email, organization, referral, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(newsletter, first_name, last_name, email, organization, referral, created_at)
      .run();
  } catch (e) {
    // Unique index trip means this email already signed up for this newsletter.
    if (String(e.message || "").includes("UNIQUE")) {
      return json({ ok: true, note: "already signed up" }, 200);
    }
    return json({ error: "Could not save your signup. Please try again." }, 500);
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
