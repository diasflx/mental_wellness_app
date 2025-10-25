import './globals.css'
import { AuthProvider } from './contexts/AuthContext'

export const metadata = {
  title: 'Mental Wellness Hub',
  description: 'Your personal space for mental health and well-being',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
