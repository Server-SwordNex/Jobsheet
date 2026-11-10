import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Routes, Route, Navigate } from 'react-router-dom'
console.log('localStorage user:', JSON.parse(localStorage.getItem('user')));
import SearchPage from "./pages/SearchPage/SearchPage.jsx"
import LoginPage from "./pages/LoginPage/LoginPage.jsx"
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx"
import GoogleRegisterPage from "./pages/GoogleRegisterPage/GoogleRegisterPage.jsx"
import PricingPage from './pages/PricingPage/PricingPage.jsx'
import PricingInfo from './pages/PricingInfo/PricingInfo.jsx'
import SuperAdminLogin from "./pages/SuperAdminLogin/SuperAdminLogin.jsx"
import Dashboard from "./pages/Dashboard/Dashboard.jsx"
import CreateJobSheet from './pages/CreateJobSheet/CreateJobSheet.jsx'
import JobSheets from "./pages/JobSheets/JobSheets.jsx"
import DraftsPage from "./pages/DraftsPage/DraftsPage.jsx"
import Technicians from "./pages/Technicians/Technicians.jsx"
import Reports from './pages/Reports/Reports.jsx'
import Calendar from './pages/Calendar/Calendar.jsx'
import SettingsPage from './pages/Settings/SettingsPage.jsx'
import SubscriptionPage from './pages/SubscriptionPage/SubscriptionPage.jsx'
import Layout from "./components/Layout/Layout.jsx"
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import SuperAdminRoute from './components/SuperAdminRoute/SuperAdminRoute.jsx'
import SuperAdminLayout from './pages/SuperAdminDashboard/SuperAdminLayout/SuperAdminLayout.jsx'
import SuperAdminDashboard from './pages/SuperAdminDashboard/SuperAdminDashboard/SuperAdminDashboard.jsx'
import SuperAdminPlans from './pages/SuperAdminDashboard/SuperAdminPlans/SuperAdminPlans.jsx'
import SuperAdminAnnouncements from './pages/SuperAdminDashboard/SuperAdminAnnouncements/SuperAdminAnnouncements.jsx'
import SuperAdminTickets from './pages/SuperAdminDashboard/SuperAdminTickets/SuperAdminTickets.jsx'

const Placeholder = ({ title }) => (
  <div>
    <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px', color: 'var(--dark)' }}>{title}</h1>
    <p style={{ color: 'rgba(var(--dark-rgb),0.5)', fontSize: 15, margin: 0 }}>This page is under construction.</p>
  </div>
)

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="dark"
        toastStyle={{
          background: 'rgba(30, 27, 75, 0.95)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(242,5,25,0.2)',
          borderRadius: '12px',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      />
      <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/google-register" element={<GoogleRegisterPage />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/admin/login" element={<Navigate to="/superadmin/login" replace />} />
      <Route path="/admin" element={<Navigate to="/superadmin/dashboard" replace />} />
      <Route path="/admin/*" element={<Navigate to="/superadmin/dashboard" replace />} />
      <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/job-sheets" element={<JobSheets />} />
        <Route path="/drafts" element={<DraftsPage />} />
        <Route path="/create-job-sheet" element={<CreateJobSheet />} />
        <Route path="/create-job-sheet/new" element={<CreateJobSheet />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/technicians" element={<Technicians />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
      </Route>
      </Route>
      <Route path="/superadmin" element={<SuperAdminRoute />}>
        <Route element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="plans" element={<SuperAdminPlans />} />
          <Route path="announcements" element={<SuperAdminAnnouncements />} />
          <Route path="tickets" element={<SuperAdminTickets />} />
        </Route>
      </Route>
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/pricing-info" element={<PricingInfo />} />
      <Route path="*" element={<Navigate to="/search" replace />} />
    </Routes>
    </>
  )
}

export default App

