import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/adminDashboard.jsx';
import Login from './pages/login.jsx';
import DLogin from './pages/dlogin.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}/>
        <Route path="/login" element={<Login />}/> {/*for admin login*/}
        <Route path="/userLogin" element={<DLogin />}/> {/*for decoy login*/}
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
