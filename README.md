# EnvBuddy CLI

> Effortlessly sync, share, and restore `.env` files across all your projects and environments — from your terminal.

---

## 💡 Why EnvBuddy?

Managing `.env` files across local machines, repos, and team members sucks.  
You end up with missing variables, overwritten secrets, and broken environments.

**EnvBuddy changes that.**

---

## 🚀 What You Can Do

- 🔐 **Securely back up** your `.env` files to the cloud
- 🧠 **Organize** them by project and environment (dev, prod, staging…)
- ⚡ **Restore** lost `.env` files instantly
- 🌍 **Collaborate** easily with teammates
- 🧪 Works entirely from your CLI — no UI needed

---

## 📦 Install

```bash
npm install -g envbuddy-cli
```
---

## 🧪 Example Workflow
```bash

# 1. Init your CLI
envbuddy init

# 2. Register or login
envbuddy register
envbuddy login

# 3. Create a new project
envbuddy create

# 4. Push your env file
envbuddy push .env -e development

# 5. Restore it on another machine
envbuddy pull-vars -e development
```
## 🔥 Real Use Cases
✅ Format your laptop? Just pull it back
✅ Onboarding a new dev? Share a project ID
✅ Running CI/CD? Sync staging + prod vars
✅ Broke your ```.env?``` Restore it in 3 seconds
## 🛠 Core CLI Commands
```bash
envbuddy init              # Set API + default project
envbuddy register          # Sign up with email/password
envbuddy login             # Auth & store token
envbuddy create            # Create a new project
envbuddy push .env         # Upload local env file
envbuddy pull-vars         # Download and restore .env
envbuddy list              # List your projects
envbuddy logout            # Log out
```
## 🌱 Coming Soon
Here’s what we’re working on next:

🧑‍🤝‍🧑 Team Sharing — invite teammates to projects

⏳ Version History & Rollbacks — restore older batches

🧩 GitHub Actions Integration — auto-pull during deploy

🗂️ Encrypted Folders — manage secrets by module

🧪 .env Linter — detect issues & duplicates before pushing

🔄 Automatic Sync — watch .env changes locally

## 👨‍💻 Built With

Node.js + Commander CLI

Express.js API

Supabase (Auth + Storage + RLS)

Hosted on Vercel + Supabase

## 📬 Feedback & Ideas

This tool is in active development. If you use it, love it, or break it — I want to hear from you.

→ Open an issue
→ DM me on Twitter @MohamedOualhar2
→ Or fork and contribute

## 👇 Ready to try it?
```bash
npm install -g envbuddy-cli
envbuddy init
```
Your ```.env``` files just got version control — without Git.
