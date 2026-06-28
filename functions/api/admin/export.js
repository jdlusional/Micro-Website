// GET /api/admin/export?key=YOUR_SECRET&newsletter=house|f4f
//
// Returns a CSV of signups that opens directly in Excel.
// Protected by a secret key stored as the ADMIN_KEY environment
// variable in Cloudflare (never hard coded here).
//
// Examples:
//   /api/admin/export?key=YOUR_SECRET&newsletter=house
//       -> House Rules signups
//   /api/admin/export?key=YOUR_SECRET&newsletter=f4f
//       -> Fellowships4Free signups
//   /api/admin/export?key=YOUR_SECRET
//       -> everyone, with the newsletter column included

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const key = url.searchParams.get("key") || "";
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return new Response("Not authorized.", { status: 401 });
  }

  const which = (url.searchParams.get("newsletter") || "").toLowerCase();
  const map = { house: "House Rules", f4f: "Fellowships4Free" };
  const newsletter = map[which] || null;

  let rows;
  try {
    if (newsletter) {
      rows = await env.DB.prepare(
        `SELECT newsletter, first_name, last_name, email, organization, referral, created_at
           FROM subscribers
          WHERE newsletter = ?
          ORDER BY created_at ASC`
      ).bind(newsletter).all();
    } else {
      rows = await env.DB.prepare(
        `SELECT newsletter, first_name, last_name, email, organization, referral, created_at
           FROM subscribers
          ORDER BY newsletter ASC, created_at ASC`
      ).all();
    }
  } catch (e) {
    return new Response("Database error.", { status: 500 });
  }

  const records = (rows && rows.results) ? rows.results : [];

  const header = ["Newsletter", "First Name", "Last Name", "Email", "Organization", "How They Found Us", "Signed Up"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of records) {
    lines.push([
      r.newsletter, r.first_name, r.last_name, r.email,
      r.organization || "", r.referral || "", r.created_at
    ].map(csvCell).join(","));
  }
  // BOM so Excel reads UTF-8 cleanly.
  const csv = "\uFEFF" + lines.join("\r\n");

  const tag = newsletter ? which : "all";
  const today = new Date().toISOString().slice(0, 10);
  const filename = `signups-${tag}-${today}.csv`;

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
