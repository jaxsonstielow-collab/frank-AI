# Frank GPT-4 Chatbot for Fly.io

## Setup & Deploy

1. Clone repo  
2. Set your OpenAI API key secret on Fly.io  
   ```
   flyctl secrets set OPENAI_API_KEY=sk-xxx
   ```
3. Deploy  
   ```
   flyctl deploy
   ```
4. Open app URL from Fly.io output

---

## Development

- Run locally:  
  ```
  npm install
  node server.js
  ```
- Client is in `client/` folder — React app bootstrapped with create-react-app.

---

## Notes

- Backend serves React frontend static files.  
- Ensure you build client before deploy or use Docker to build it.  
- React UI is sanitized to avoid React #130 errors.
