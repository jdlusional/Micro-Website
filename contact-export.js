// GET /api/admin/contact-export?key=YOUR_SECRET
//
// Returns a CSV of contact submissions that opens directly in Excel.
// Protected by the same ADMIN_KEY secret used for the newsletter export.

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const key = url.searchParams.get("key") || "";
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return new Response("Not authorized.", { status: 401 });
  }

  let rows;
  try {
    rows = await env.DB.prepare(
      `SELECT first_name, last_name, email, phone, location, purpose, urgency, referral, created_at
         FROM contacts
        ORDER BY created_at ASC`
    ).all();
  } catch (e) {
    return new Response("Database error.", { status: 500 });
  }

  const records = (rows && rows.results) ? rows.results : [];

  const header = ["First Name", "Last Name", "Email", "Phone", "Location", "Purpose", "Urgency", "How They Heard", "Submitted"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of records) {
    lines.push([
      r.first_name, r.last_name, r.email, r.phone || "",
      r.location, r.purpose, r.urgency, r.referral || "", r.created_at
    ].map(csvCell).join(","));
  }
  // BOM so Excel reads UTF-8 cleanly.
  const csv = "\uFEFF" + lines.join("\r\n");

  const today = new Date().toISOString().slice(0, 10);
  const filename = `contacts-${today}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

function csvCell(v) {
  const s = (v === undefined || v === null) ? "" : String(v);
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
