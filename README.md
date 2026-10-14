# EduTrack — Student Result Management System

A responsive student result dashboard built with semantic HTML, modern CSS, and vanilla JavaScript. It demonstrates client-side CRUD operations, search, filters, result calculation, validation, browser storage, and CSV export.

## Features

- Dashboard statistics: total students, pass count, fail count, pass rate, and average marks.
- Search by student name or roll number.
- Filter by Pass/Fail and class.
- Sort by name (A–Z / Z–A) or marks (highest / lowest).
- Toggle dark mode; preference is remembered in the browser.
- Add, edit, and delete student records.
- Input validation and unique roll-number checks.
- Automatic result calculation (33/100 is the pass mark in this demo).
- Persist records using browser Local Storage.
- Export the currently filtered records as CSV.
- Responsive layout and keyboard accessibility improvements.

## Tech stack

- HTML5
- CSS3 (responsive layout and media queries)
- Vanilla JavaScript (ES6+)
- Local Storage API
- Git / GitHub

## Run locally

No build tools or package installation are required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For a more realistic local development workflow, use the VS Code Live Server extension.

## Project structure

```text
student-result-management-system/
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
```

## Important limitations

This is a frontend portfolio demo. Local Storage data is specific to the browser and device, and it is not a secure database. There is no authentication, server-side authorization, or shared multi-user data. For production, add a backend API, database, authentication, server-side validation, and automated tests.

## Learning outcomes

- DOM manipulation and event delegation
- Search and multi-filter logic
- Form validation and CRUD operations
- Local Storage persistence
- CSV file generation
- Responsive design and accessibility basics

## License

Educational and portfolio use. Add a license file if you choose to publish this project under a specific open-source license.
