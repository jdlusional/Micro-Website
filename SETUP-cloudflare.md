# Newsletter signups: setup and deployment

This explains how to take the files in this folder live on
jonathanlindavis.com so the signup form on newsletters.html actually
stores people and lets you export them to Excel.

Right now your site is hosted on GitHub Pages. GitHub Pages can only
serve files. It cannot receive a form or store anyone. So the plan is to
move this one site onto Cloudflare Pages, which serves the exact same
files but can also run the small bits of backend code in the functions
folder. Nothing about how you edit the site changes. You still push to
the same GitHub repo. Cloudflare watches that repo and publishes for you.

You will do the clicking. None of it is hard. Follow the steps in order.

------------------------------------------------------------
WHAT IS IN THIS FOLDER
------------------------------------------------------------

newsletters.html              The signup page.
projects.html                 Renamed from research.html, now with the form button.
research.html                 A tiny stub that forwards old links to projects.html.
style.css                     Your stylesheet, with the form styling added at the bottom.
site.js                       Your script, with the form handling added at the bottom.
index.html, about.html,
consulting.html, writing.html,
house-rules.html              Same as before, with the Projects link updated.
ten_issues_90th_legislature.html  Email Newsletter link now points to the form.
schema.sql                    The database table definition.
functions/api/subscribe.js    Receives a signup and saves it.
functions/api/admin/export.js Gives you the CSV export, protected by a secret key.

Drop all of these into your jonathanlindavis.com repo, keeping the
functions folder structure exactly as it is. Commit and push as usual.

------------------------------------------------------------
STEP 1: MAKE A CLOUDFLARE ACCOUNT
------------------------------------------------------------

1. Go to dash.cloudflare.com and sign up. It is free.
2. Verify your email.

You do NOT need to move your domain nameservers for this. Your DNS
already points through Cloudflare per your setup, which makes the last
step simpler, but even if it did not, Pages would still work.

------------------------------------------------------------
STEP 2: CREATE THE DATABASE
------------------------------------------------------------

1. In the Cloudflare dashboard left menu, open "Storage and Databases",
   then "D1 SQL Database".
2. Click "Create database".
3. Name it:  newsletter-signups
4. Click Create.
5. Open the database you just made. Find the "Console" tab.
6. Open schema.sql from this folder, copy everything in it, paste it into
   the console, and run it. You should see it report success.

That builds the table that holds your signups.

------------------------------------------------------------
STEP 3: CONNECT YOUR REPO TO CLOUDFLARE PAGES
------------------------------------------------------------

1. In the left menu open "Workers and Pages".
2. Click "Create", then choose the "Pages" tab, then
   "Connect to Git".
3. Authorize Cloudflare to see your GitHub, and pick the
   jonathanlindavis.com repository.
4. Build settings:
   - Framework preset: None
   - Build command: leave blank
   - Build output directory: leave as / (the root)
   Your site is plain HTML, so there is no build step.
5. Click "Save and Deploy". Cloudflare publishes your site. It will give
   you a temporary address like your-project.pages.dev. Open it and click
   around to confirm the site looks right.

------------------------------------------------------------
STEP 4: BIND THE DATABASE TO THE SITE
------------------------------------------------------------

The code refers to the database as DB. You have to tell Cloudflare that
DB means the database you made in Step 2.

1. Still in Workers and Pages, open your new Pages project.
2. Go to "Settings", then "Bindings" (older dashboards call this
   "Functions", then "D1 database bindings").
3. Click "Add", choose "D1 database".
   - Variable name:  DB
   - D1 database:    newsletter-signups
4. Save.

------------------------------------------------------------
STEP 5: SET YOUR SECRET EXPORT KEY
------------------------------------------------------------

This is the password that protects your subscriber list so only you can
download it.

1. In the same project, go to "Settings", then "Variables and Secrets"
   (older dashboards: "Environment variables").
2. Add a variable:
   - Name:  ADMIN_KEY
   - Value: a long random string you invent. Treat it like a password.
            Something like  hr-f4f-9Q2vK7pLm4Xz  is fine. Longer is better.
   - Click "Encrypt" so it is stored as a secret.
3. Save.

Write that key down somewhere safe. You need it to export.

------------------------------------------------------------
STEP 6: REDEPLOY SO THE BINDINGS TAKE EFFECT
------------------------------------------------------------

After adding the binding and the secret, trigger one more deploy so they
apply. Either push any small change to the repo, or in the Pages project
open "Deployments" and click "Retry deployment" on the latest one.

------------------------------------------------------------
STEP 7: POINT YOUR DOMAIN AT THE PAGES PROJECT
------------------------------------------------------------

1. In your Pages project, open "Custom domains".
2. Click "Set up a custom domain" and enter  jonathanlindavis.com
   (and add  www.jonathanlindavis.com  too if you use it).
3. Because your DNS is already on Cloudflare, it will offer to wire it up
   for you. Accept. It may take a few minutes to go green.

Important: once the custom domain is on Cloudflare Pages, that is what
serves the site. You can turn off GitHub Pages for this repo to avoid
confusion, but it is not strictly required.

------------------------------------------------------------
TESTING IT
------------------------------------------------------------

1. Visit jonathanlindavis.com/newsletters.html
2. Fill the form and submit. You should see "You are signed up. Thank you."
3. Check it landed: in the D1 database Console tab, run
      SELECT * FROM subscribers;
   You should see your test row.

------------------------------------------------------------
GETTING YOUR LISTS OUT (THE EXPORT)
------------------------------------------------------------

Open these in your browser. Replace YOUR_SECRET with the ADMIN_KEY you set.

House Rules list:
   https://jonathanlindavis.com/api/admin/export?key=YOUR_SECRET&newsletter=house

Fellowships4Free list:
   https://jonathanlindavis.com/api/admin/export?key=YOUR_SECRET&newsletter=f4f

Everyone in one file:
   https://jonathanlindavis.com/api/admin/export?key=YOUR_SECRET

Each link downloads a .csv that opens straight in Excel. Bookmark the two
you use most. Anyone without the key gets "Not authorized."

------------------------------------------------------------
NOTES
------------------------------------------------------------

- The same email can sign up for both newsletters, but not twice for the
  same one. A repeat just quietly succeeds.
- The form has a hidden honeypot field. Bots that fill it are silently
  ignored. There is no CAPTCHA and nothing from Google.
- To change the privacy wording or the fields later, edit newsletters.html.
  If you add a field, also add it in functions/api/subscribe.js and in the
  export header in functions/api/admin/export.js.
- Keep your ADMIN_KEY private. If it ever leaks, change the value in
  Step 5 and redeploy. The old key stops working immediately.
