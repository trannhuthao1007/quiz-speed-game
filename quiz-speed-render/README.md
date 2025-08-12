# Quiz Speed Game - Deploy on Render

This package contains a small Node.js + Socket.IO app (server) and a client HTML page to run a quiz where teams compete by speed.

Structure:
- server.js          -> Express + Socket.IO server
- package.json       -> dependencies & start script
- public/
  - index.html       -> client page (Teacher + Team)

## Quick deploy to Render

1. Create a GitHub repo with these files, or upload this project as a ZIP to Render.
2. On Render, create a new **Web Service** and connect to your repo.
3. Set the build & start command:
   - Build command: (none needed)
   - Start command: `npm start`
4. Deploy. Render will give you a public URL, e.g. `https://your-app.onrender.com`.

## How to use

1. Open the public URL in a browser. In the client page, enter the **server URL** (the same Render URL) and click **Kết nối**.
2. Choose role **Teacher** on one device (the teacher), and role **Team** on students' devices.
3. Teacher: create a question (text + 4 options) and click **Hiển thị câu cho tất cả**, then when ready click **Bắt đầu tính thời gian**.
4. Students: after teacher starts timer, answer buttons will be enabled; the first team who sends a correct answer receives base points + bonus for speed.
5. Scores update automatically on all clients.

## Notes / Next steps

- To secure teacher controls, consider adding a simple password check on teacher registration.
- To persist scores long-term, integrate a database (SQLite, MongoDB, PostgreSQL) and add endpoints to export CSV.
- For custom domain, add domain to Render and update DNS records.

If you want, I can:
- create the GitHub repo for you and push the files,
- or produce a ready-to-download ZIP (this file).
