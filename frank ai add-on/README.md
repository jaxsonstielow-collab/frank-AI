# Frank GPT-4 Chatbot - Render Deployment

## Setup

1. Edit `/server/.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-xxxx
```

2. To build frontend locally (optional):

```
cd client
npm install
npm run build
```

3. Push your repo to GitHub.

4. On Render:

- Create a new **Web Service**.
- Connect to your GitHub repo.
- Set the build command:

```
cd client && npm install && npm run build && cd ../server && npm install
```

- Set the start command:

```
cd server && npm start
```

- Add environment variable `OPENAI_API_KEY` with your key.

5. Deploy and visit your app URL!

---

This repo has:

- `/server`: Express backend serving API + React frontend static files
- `/client`: React frontend app
