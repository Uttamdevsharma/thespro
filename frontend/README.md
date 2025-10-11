# ThesPro - Thesis/Project Management System

ThesPro is a comprehensive web application designed to streamline the management of academic theses and research projects. It provides a collaborative platform for students, supervisors, and committee members to manage proposals, track progress, and facilitate communication.

## ✨ Features

- **Role-Based Access Control:** Distinct dashboards and functionalities for three user roles, with all interactions restricted to the user's own department:
    - **Student:** Can submit research proposals, track their status, view feedback, and interact with supervisors within their department.
    - **Supervisor:** Can review and manage pending proposals, provide guidance, and oversee student progress within their department.
    - **Committee:** Can oversee all research activities, manage research cells, and view all registered students and teachers within their department.
- **Department-wise Functionality:** The system is now organized by departments (e.g., CSE, EEE, BBA). Students, supervisors, and committee members are associated with a specific department, ensuring that all interactions and data are segregated accordingly.
- **Proposal Submission & Tracking:** A streamlined workflow for submitting, reviewing, and tracking the status of research proposals within a department.
- **Real-time Communication:** Integrated chat and notification features to foster seamless communication within a department.
- **Centralized Management:** Dashboards for each role to provide a clear overview of ongoing tasks and activities within their department.

## 🚀 Tech Stack

- **Frontend:**
    - [React](https://reactjs.org/) (v19)
    - [Vite](https://vitejs.dev/)
    - [React Router DOM](https://reactrouter.com/) for routing
    - [Redux Toolkit](https://redux-toolkit.js.org/) for state management
    - [Tailwind CSS](https://tailwindcss.com/) for styling
- **Backend & Database:**
    - [Firebase](https://firebase.google.com/):
        - Firebase Authentication for user management
        - Firestore for database
- **Linting & Development:**
    - [ESLint](https://eslint.org/)
    - [Vite Dev Server](https://vitejs.dev/guide/server.html)

## 📦 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/thespro.git
    cd thespro
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Firebase:**
    - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    - In your project's settings, add a new Web App.
    - Copy the `firebaseConfig` object.
    - Create a new file named `.env.local` in the root of your project directory.
    - Add your Firebase configuration to the `.env.local` file. **Remember to prefix environment variables with `VITE_` for Vite projects.**

    Your `.env.local` file should look like this:
    ```env
    VITE_FIREBASE_API_KEY="YOUR_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_APP_ID"
    ```

4.  **Update Firebase Configuration in Code:**
    - Modify `src/firebase.js` to use the environment variables from `.env.local`. This is more secure than hardcoding keys.

    ```javascript
    // src/firebase.js
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);

    export const auth = getAuth(app);
    export const db = getFirestore(app);
    ```

### Running the Application

- **To start the development server:**
  ```sh
  npm run dev
  ```
  The application will be available at `http://localhost:5173` (or the next available port).

- **To build the project for production:**
  ```sh
  npm run build
  ```
  The production-ready files will be in the `dist` folder.

- **To run the linter:**
  ```sh
  npm run lint
  ```

## 📁 Project Structure

The project follows a standard Vite + React structure, with source code located in the `src` directory.

```
thespro/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, icons, etc.
│   ├── components/     # Reusable React components (Navbar, Sidebar)
│   ├── contexts/       # React contexts (AuthContext)
│   ├── features/       # Redux slices (apiSlice, userSlice)
│   ├── pages/          # Top-level page components for each role
│   │   ├── committee/
│   │   ├── student/
│   │   └── supervisor/
│   ├── router/         # React Router configuration
│   ├── store/          # Redux store setup
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point of the application
│   └── firebase.js     # Firebase configuration
├── .gitignore
├── package.json
└── README.md
```

## 📜 Available Scripts

In the `package.json` file, you can find the following scripts:

- `npm run dev`: Starts the development server using Vite.
- `npm run build`: Bundles the application for production.
- `npm run lint`: Runs ESLint to analyze the code for potential errors.
- `npm run test`: (Not yet implemented) Placeholder for running tests.

---

*This README was generated by Gemini.*
