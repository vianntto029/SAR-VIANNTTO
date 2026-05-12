import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AttendanceProvider } from './context/AttendanceContext'
import StudentView from './views/StudentView'
import AdminView from './views/AdminView'
import LoginView from './views/LoginView'

const router = createBrowserRouter([
  {
    path: '/',
    element: <StudentView />,
  },
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/admin',
    element: <AdminView />,
  },
])

export default function App() {
  return (
    <AttendanceProvider>
      <RouterProvider router={router} />
    </AttendanceProvider>
  )
}