# Resume Builder — Documentation

## Overview

The **Resume Builder** project helps users create structured resumes from input forms. It typically provides a **live preview** and an **export/print** workflow (depending on the implementation).

## Key Features

- Form-based resume input (personal info, summary, experience, education, skills)
- Live preview to validate formatting
- Export/print output (if supported by the project)

## User Workflow

1. Open the app in your browser.
2. Fill out the resume fields in the form.
3. Review the live preview.
4. Adjust ordering/sections as needed.
5. Export or print the resume (if the UI provides this).

## What to Edit / Customize

- Resume sections and labels (e.g., add/remove sections like Projects, Certifications)
- Default templates/styles
- Export behavior (PDF generation, print styles, download formats)

## Tech Stack

Update this section based on what the project actually uses (example: React + Vite, Tailwind, etc.).

## Project Structure (typical)

- `src/` — application logic
- `components/` — UI blocks (forms, preview, section editor)
- `styles/` — CSS/Tailwind styles
- `public/` / `assets/` — static files

## Troubleshooting

- App won’t start: run `npm install` then restart.
- Preview not updating: verify controlled input bindings/state management.
- Export/print missing: check whether export is implemented and confirm browser print/PDF permissions.

## Notes

This documentation is intentionally brief; expand it when you add templates, multi-page resumes, or advanced export options.
