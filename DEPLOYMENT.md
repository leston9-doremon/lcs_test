# Deployment Guide

This repo is set up for:

- Frontend on Cloudflare Pages
- Backend on Render
- Source control on GitHub

## Frontend

Deploy the `frontend` folder to Cloudflare Pages.

- Build command: leave empty
- Output directory: `frontend`

The frontend now prefers the live Render API in production:

- `https://loretto-cbse-school.onrender.com/api`

It still uses localhost automatically during local development.

## Backend

Deploy the `backend` folder to Render as a Node web service.

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Set these environment variables on Render:

- `MONGODB_URI`
- `CORS_ORIGIN`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_TOKEN`

Optional:

- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_EMAIL`

Example `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://your-project.pages.dev,https://www.yourdomain.com
```

## GitHub Flow

1. Push this repo to GitHub.
2. Connect the repo to Cloudflare Pages for the frontend.
3. Connect the same repo to Render for the backend.

## Notes

- `frontend/index.html` was left untouched.
- The deploy wiring now points production frontend API calls to Render by default instead of assuming same-origin `/api`.
