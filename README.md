# A. Majid Portfolio

Static portfolio website prepared for deployment on Vercel.

## Deploy on Vercel

1. Push this repository to GitHub.
2. In Vercel, select **Add New → Project**.
3. Import the GitHub repository.
4. Keep the framework preset as **Other**.
5. Deploy. The included `vercel.json` uses `dist` as the output directory.

No environment variables or paid Vercel features are required.

## Portfolio Studio and case studies

Project cards now open `/projects/:slug`. The private editor is at `/admin`.
Read [CMS setup](cms/SETUP.md) to connect authentication, persistent project data and image uploads. Until configured, public pages read the eight migrated projects from `dist/projects.json` and the editor stays disabled.
