import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { AttendanceProvider } from './context/AttendanceContext'
import StudentView from './views/StudentView'
import AdminView from './views/AdminView'
import LoginView from './views/LoginView'
import SurveyView from './views/SurveyView'

function Layout() {
  return (
    <AttendanceProvider>
      <Outlet />
    </AttendanceProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <StudentView /> },
      { path: '/encuesta', element: <SurveyView /> },
      { path: '/login', element: <LoginView /> },
      { path: '/admin', element: <AdminView /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}