# Soccer Training Tracker

A simple React, TypeScript, and Tailwind CSS web app for tracking soccer players, drills, tutorial videos, training time, and progress.

The sample data is based on `Copy of Soccer (1).xlsx`, using the `Jordan 2.0` sheet as the starting player plan. Drill video links were pulled from the workbook's linked drill cells when available.

## Features

- Home page with Jordan's sample player plan
- Embedded YouTube tutorial video when a drill has a video link
- Training timer with start, pause, reset, and save-session controls
- Progress percentage, completed drills, notes, and ratings
- Players page for adding, editing, deleting, and selecting players
- Drills page for adding, editing, deleting, completing, rating, and linking videos
- Training Sessions page for logging minutes and notes
- Progress page with player summaries
- Browser `localStorage` saving
- Reset button to restore the Excel-based sample data

## Setup

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

- Data is stored in your browser under `soccer-training-tracker-v1`.
- YouTube links are converted to embedded videos where possible.
- If a video cannot be embedded by YouTube, the drill still keeps its original link.
