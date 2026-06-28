# Deploying these changes

This is an amendment to the site you already have running on Cloudflare,
not a fresh setup. Because the plumbing already exists, this is short.
There is exactly one manual Cloudflare step, creating the new contacts
table. Everything else deploys automatically when you push to GitHub.

------------------------------------------------------------
WHAT CHANGED
------------------------------------------------------------

New files to add:
  contact.html                              the new Contact Us page
  schema-contacts.sql                       the contacts table definition
  functions/api/contact.js                  receives contact submissions
  functions/api/admin/contact-export.js     exports contact submissions

Files that changed and must be replaced:
  index.html          Home Projects card wording, nav, footer button
  projects.html       Fellowships4Free renamed and moved to Active, nav, footer
  newsletters.html    checkbox newsletter chooser, moved flashing confirmation
  about.html          nav tab, footer button
  consulting.html     nav tab, footer button
  writing.html        nav tab, footer button
  house-rules.html    nav tab, footer button
  style.css           checkbox, flash, footer button, disclosure styling
  site.js             new checkbox logic and the contact form handler
  functions/api/subscribe.js     now accepts multiple newsletters
  functions/api/admin/export.js  All subscribers now included in each list

Unchanged, leave as they are:
  research.html, ten_issues_90th_legislature.html, schema.sql, Assets, CNAME

------------------------------------------------------------
STEP 1: PUT THE FILES IN GITHUB
------------------------------------------------------------

Replace the changed files and add the new ones in your jonathanlindavis
repository, keeping the functions folder structure intact:

  functions/api/contact.js
  functions/api/admin/contact-export.js

The same path rule as before applies: these must sit at those exact
paths, not loose at the root. When creating them on GitHub web, type the
full path into the filename box (for example
functions/api/admin/contact-export.js) so GitHub builds the folders.

Commit and push. Cloudflare auto-deploys on the push, same as always.

------------------------------------------------------------
STEP 2: CREATE THE CONTACTS TABLE (the one manual step)
------------------------------------------------------------

The contact form writes to a new table that does not exist yet. Build it:

1. Cloudflare dashboard, open your D1 database newslettersignup.
2. Open the Console tab.
3. Paste this and run it (one statement, no comment lines):

CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, location TEXT NOT NULL, purpose TEXT NOT NULL, urgency TEXT NOT NULL, referral TEXT NOT NULL, created_at TEXT NOT NULL);

4. Confirm with /tables, you should now see both subscribers and contacts.

The database binding (DB) and the secret (ADMIN_KEY) already exist and
already apply, so there is nothing else to configure in Cloudflare.

------------------------------------------------------------
STEP 3: TEST
------------------------------------------------------------

Newsletter form (jonathanlindavis.com/newsletters.html):
  - Check more than one newsletter, submit, confirm the green flashing
    "You are signed up. Thank you." appears above the button.
  - Check "All newsletters" and confirm the other two lock and grey out.
  - In the database console: SELECT * FROM subscribers;
    A person who chose two newsletters should appear as two rows.

Contact form (jonathanlindavis.com/contact.html):
  - Fill it out and submit, confirm the green flashing success message.
  - In the database console: SELECT * FROM contacts;
    Your test row should appear.

------------------------------------------------------------
GETTING YOUR DATA OUT
------------------------------------------------------------

Newsletter lists (each now includes "All" subscribers automatically):
  jonathanlindavis.com/api/admin/export?key=YOUR_SECRET&newsletter=house
  jonathanlindavis.com/api/admin/export?key=YOUR_SECRET&newsletter=f4f
  jonathanlindavis.com/api/admin/export?key=YOUR_SECRET            (everyone)

Contact submissions:
  jonathanlindavis.com/api/admin/contact-export?key=YOUR_SECRET

Same secret key as before. Replace YOUR_SECRET with your ADMIN_KEY.

------------------------------------------------------------
NOTES
------------------------------------------------------------

- Clear any test rows before real use:
    DELETE FROM subscribers;   (only if all rows are tests)
    DELETE FROM contacts;      (only if all rows are tests)
- The disclosure above the contact form reuses your Consulting page
  statute language verbatim, with one framing sentence in front. To
  change the framing sentence, edit contact.html.
- The flashing confirmation pulses slowly and stops automatically for
  visitors who have reduced-motion enabled in their system settings.
