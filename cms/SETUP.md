# Portfolio Studio setup

The public portfolio is connected to Supabase project `auwbtikrngvcwntsaxxq` (a-majid-portfolio-cms). All eight projects have been imported. `/admin` is the private editor interface. An approved editor account still needs to be created before sign-in can be verified. No local-browser-only save is presented as a published change.

## Connect persistent content

1. Create a Supabase project. Run `cms/schema.sql`, then `cms/seed.sql` in its SQL editor. Seed before connecting so the existing portfolio stays populated.
2. In Authentication, disable public sign-ups. Create your editor account using the dashboard and set a strong password.
3. Copy that user's UUID and run `insert into public.portfolio_admins(user_id) values ('YOUR-USER-UUID');`. Other authenticated accounts cannot edit projects or upload images.
4. In `dist/cms-config.json`, set `supabaseUrl` and `publishableKey` to the project's URL and public/publishable key. Never use a secret or service-role key here.
5. Commit that public configuration and let Vercel redeploy. Open `/admin` and sign in. Subsequent content changes are stored in Supabase and appear without redeploying.
6. Verify: signed-out visitors see published projects only; an unlisted account cannot insert/update/delete or upload; the editor can upload, save a draft, publish, edit, and delete. Verify again after signing out and from a separate browser.

Images in the public bucket are publicly accessible by URL, including uploads attached to drafts. Do not upload confidential content. Removing a gallery item or deleting a project does not delete its underlying uploaded image. Use Storage in Supabase to remove unused images.

The editor supports title, page address, category/role, year, image uploads, alternative text, description, optional problem and solution, tools/technologies, optional live and Behance links, gallery captions, order, drafts and publishing. Text is rendered as plain text rather than executable HTML. Description-only projects hide empty sections.

Existing project descriptions are deliberately brief. Problem/solution statements and exact technology lists have not been invented; fill them in with verified details using the editor. Hero/about/contact copy remains in `dist/index.html`.

## Local development

Run `npm run dev`, then open http://localhost:8080. Run `npm test` and `npm run build` before committing. The development server handles `/projects/:slug` and `/admin` like Vercel.

## Provisioning status

Supabase is provisioned, schema and seed applied, public configuration connected, and the security advisor returned no notices. Anonymous readers and authenticated non-editors are restricted by RLS. Editor-account creation and the signed-in upload/save/publish flow remain pending. GitHub auto-deploys to Vercel; direct Vercel account access returned 403 for team `emmjaymedia1-2632`. Only the public Supabase key is included in the frontend.

## Dashboard workflow

Sign-in opens the overview with total, live and draft counts, project thumbnails, search and visibility filtering. Edit opens a separate editor. Confirmed saves return to the overview and show a dismissible success notification; errors keep the editor and entered content visible. Counts update from confirmed saved records.
