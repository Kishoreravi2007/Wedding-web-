# Firebase Setup Guide

Follow these steps to connect your Firebase project to this application:

1.  **Create a Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click "Add project" and follow the on-screen instructions.

2.  **Get Firebase Configuration:**
    - In your Firebase project, go to **Project settings** (click the gear icon).
    - Under the **General** tab, scroll down to the "Your apps" section.
    - Click the web icon (`</>`) to create a new web app.
    - Enter an app nickname and click "Register app".
    - You will see a block of code with your Firebase configuration. It will look like this:

      ```javascript
      const firebaseConfig = {
        apiKey: "AIzaSyDYNg6YQoCcVmCqjjgb3AzGfO8weB4p3ms",
        authDomain: "weddingweb-9421e.firebaseapp.com",
        projectId: "weddingweb-9421e",
        storageBucket: "weddingweb-9421e.firebasestorage.app",
        messagingSenderId: "859180077453",
        appId: "1:859180077453:web:976075a1c1a63ce696adc4"
      };
      ```

3.  **Set Environment Variables:**
    - Create a `.env` file in the root of your project (or open the existing one).
    - Add the following environment variables, replacing the values with your Firebase configuration:

      ```
      VITE_FIREBASE_API_KEY=your_api_key
      VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
      VITE_FIREBASE_PROJECT_ID=your_project_id
      VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
      VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
      VITE_FIREBASE_APP_ID=your_app_id
      ```

4.  **Restart Your Application:**
    - After setting the environment variables, restart your development server to apply the changes.

- The application is now configured to use Firebase for authentication, database, and storage.
