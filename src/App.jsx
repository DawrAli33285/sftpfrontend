import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegisterPage from './register'
import LoginPage from './login'
import ResetPasswordPage from './resetpassword'
import ForgotPasswordPage from './forgotpassword'
import DashboardPage from './dashboard'
import AllFilesPage from './files'
import AdminPanel from './admindashboard'
import SuperAdminLogin from './adminlogin'
import SuperAdminRegister from './adminregister'
import SuperAdminReset from './adminreset'
import AdminRoute from './adminProtected'
import UserRoute from './userProtected'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="w-full min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<RegisterPage/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/reset-password' element={<ResetPasswordPage/>}/>
          <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
          <Route element={<UserRoute/>}>
          <Route path='/dashboard' element={<DashboardPage/>}/>
          <Route path='/files' element={<AllFilesPage/>}/>
          </Route>
          <Route element={<AdminRoute/>}>
          <Route path='/admindashboard' element={<AdminPanel/>}/>
          </Route>
          <Route path='/adminlogin' element={<SuperAdminLogin/>}/>
          <Route path='/adminregister' element={<SuperAdminRegister/>}/>
          <Route path='/adminreset' element={<SuperAdminReset/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App