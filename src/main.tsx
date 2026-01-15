import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Resolves to App.tsx
import './index.css'

import { ThemeProvider } from './context/ThemeContext'
import { UserProvider } from '@/context/UserContext'
import { seedAthletes } from '@/utils/seedAthletes';

// Expose Test Utils in Dev
if (import.meta.env.DEV) {
    (window as any).testUtils = {
        seedAthletes
    };
    console.log("🛠️ Test Utils Mounted: window.testUtils.seedAthletes()");
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <UserProvider>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </UserProvider>
    </React.StrictMode>,
)
