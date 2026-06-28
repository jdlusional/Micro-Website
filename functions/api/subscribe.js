// POST /api/subscribe
// Receives a newsletter signup from the form on newsletters.html
// and stores it in the D1 database bound as env.DB.
//
// Expects JSON:
//   { newsletters: [..], first_name, last_name, email, organization, referral, company_website }
//
// newsletters is an array. Each chosen newsletter becomes its own row,
// so the existing per-newsletter exports keep working unchanged.
// The value "All" is stored as its own row meaning "everything now and
// in the future"; exports include All subscribers in every list.
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
  const organization = clean(data.organization);
  const referral = clean(data.referral);

  // Normalize the newsletters list.
  let newsletters = Array.isArray(data.newsletters) ? data.newsletters.map(clean) : [];
  const allowed = ["House Rules", "Fellowships4Free", "All"];
  newsletters = newsletters.filter(function (n) { return allowed.indexOf(n) !== -1; });
  // If "All" is present, it is the only meaningful choice.
  if (newsletters.indexOf("All") !== -1) {
    newsletters = ["All"];
  }
  // De-duplicate.
  newsletters = newsletters.filter(function (n, i) { return newsletters.indexOf(n) === i; });

  if (newsletters.length === 0) {
    return json({ error: "Please choose at least one newsletter." }, 400);
  }
  if (!first_name || !last_name) {
    return json({ error: "Please enter your first and last name." }, 400);
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return json({ error: "Please enter a valid email." }, 400);
  }

  const created_at = new Date().toISOString();

  // Insert one row per chosen newsletter. A duplicate (same email + same
  // newsletter) is ignored rather than treated as an error.
  for (const newsletter of newsletters) {
    try {
      await env.DB.prepare(
        `INSERT INTO subscribers
          (newsletter, first_name, last_name, email, organization, referral, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(newsletter, first_name, last_name, email, organization, referral, created_at)
        .run();
    } catch (e) {
      if (String(e.message || "").includes("UNIQUE")) {
        continue; // already signed up for this one; skip quietly
      }
      return json({ error: "Could not save your signup. Please try again." }, 500);
    }
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
