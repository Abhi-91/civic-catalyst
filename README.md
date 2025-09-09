# Civic Catalyst  

An AI-powered agent that connects new developers with beginner-friendly GitHub issues based on their skills.  

---

## 🚀 Problem Statement  
New developers and students often struggle to find suitable open-source projects to contribute to. GitHub hosts millions of repositories, but filtering for beginner-friendly issues that match someone’s skills is overwhelming.  

---

## 🎯 Objective  
Civic Catalyst aims to bridge this gap by:  
- Allowing users to connect their GitHub account securely (via Descope Outbound Apps).  
- Taking a list of skills (e.g., *Python, React*).  
- Fetching beginner-friendly issues (`good first issue` label) from GitHub repositories.  
- Summarizing issues with AI to make them easy to understand.  

---

## 🛠️ Methodology  
1. **Authentication** – Descope Flow handles GitHub token exchange securely (no hardcoded tokens).  
2. **Skill Input** – User provides skills (e.g., Python, JavaScript).  
3. **GitHub Search** – Backend queries GitHub REST API for open beginner-friendly issues matching those skills.  
4. **AI Summarization** – Each issue is summarized in plain language to highlight what needs to be done.  
5. **Frontend Display** – Issues are displayed with links, repo names, and summaries.  

---

## 📌 Scope  
- Helps beginners find suitable open-source issues faster.  
- Encourages civic engagement in open-source contributions.  
- Can be extended to push results to Slack, Notion, or Calendar for task management.  

---

## ⚙️ Built With  
- React.js  
- Node.js  
- Express.js  
- GitHub REST API  
- dotenv  
- CORS  
- node-fetch  

---

## 🖼️ Demo Flow Diagram  

```mermaid
flowchart TD
    A[User enters skills] --> B[Frontend: React.js]
    B --> C[Backend: Express.js]
    C --> D[Descope Auth → GitHub Token]
    D --> E[GitHub REST API]
    E --> F[AI Summarization]
    F --> G[Frontend UI: Display curated issues]



Quick Start
Clone the repo
git clone https://github.com/your-username/civic-catalyst.git
cd civic-catalyst

Setup server
cd server
npm install
npm start

Setup frontend
cd web
npm install
npm run dev


Then visit: http://localhost:5173
