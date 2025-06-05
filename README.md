# 📝 [CollabDocs – Live Demo](https://collab-docs-ruddy.vercel.app/)

CollabDocs is a real-time collaborative document editing web application that allows users to create, edit, and share documents with others—similar to Google Docs. It offers seamless real-time editing and document sharing using modern technologies.

---

## 📄 Description

With CollabDocs, users can:

- Create new documents
- Edit and auto-save content in real time
- Share documents securely with others
- View who's online in a document
- Collaborate with multiple users simultaneously
- Receive instant updates when changes occur

---

## 🚀 Features

- ✅ JWT authentication with secure cookies
- ✅ Real-time document editing using Socket.IO
- ✅ Display online users with avatars
- ✅ Share documents with email-based access
- ✅ Auto-sync title and content changes
- ✅ Create, delete, or unshare documents
- ✅ Responsive and beautiful UI with Tailwind CSS

---

## 🛠️ Technologies Used

### Frontend

- **React.js**
- **React Router DOM**
- **Jodit React Editor**
- **Socket.IO Client**
- **Tailwind CSS**
- **SweetAlert2**

### Backend

- **Node.js + Express.js**
- **Socket.IO Server**
- **MongoDB Atlas (via Mongoose)**
- **JWT (jsonwebtoken)**
- **Cookie-parser**
- **CORS**

---

## ⚙️ How It Works

### 🔐 Authentication

- Users log in via Google or a custom system (assumed).
- JWT tokens are issued and stored in cookies for secure requests.

### 🔁 Real-Time Document Updates

- Users connect to a document room using Socket.IO namespaces.
- As content is edited, changes are saved and broadcast in real time.
- Shared users receive live updates without page refresh.

### 👥 Online Presence

- Each connected user joins a document-specific room.
- Online user avatars are shown at the top of the document.
- When users disconnect, they’re removed from the online list.

---

## 🌐 Live Site

👉 **[Visit CollabDocs Live](https://collab-docs-ruddy.vercel.app/)**

---
