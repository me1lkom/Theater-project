import React, { useEffect } from "react";
import "./App.css";
import './styles/variables.css'
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/userPages/MainPage';
import PlayPage from "./pages/userPages/PlayPage";
import AuthPage from "./pages/userPages/AuthPage";
import useAuthStore from './store/useAuthStore';
import ProfilePage from "./pages/userPages/ProfilePage";
import PaymentPage from "./pages/userPages/PaymentPage";
import ContactPage from "./pages/userPages/ContactPage";
import PanoramaPage from "./pages/userPages/PanoramaPage";
import StatisticsPage from "./pages/adminPages/StatisticsPage";
import { AdminRoute } from "./components/common/AdminRoute";
import { AuthenticatedRoute } from "./components/common/AuthenticatedRoute";
import DataManagementPage from "./pages/adminPages/DataManagementPage";
import AdminMainPage from "./pages/adminPages/AdminMainPage";

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  const theme = useAuthStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    hydrate();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/play/:id" element={<PlayPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route path="/profile" element={
              <AuthenticatedRoute>
                <ProfilePage />
              </AuthenticatedRoute>
            } />
            <Route path="/payment" element={
              <AuthenticatedRoute>
                <PaymentPage />
              </AuthenticatedRoute>
            } />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/panorama" element={<PanoramaPage />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminMainPage />
              </AdminRoute>
            } />
            <Route path="/admin/statistics" element={
              <AdminRoute>
                <StatisticsPage />
              </AdminRoute>
            } />
            <Route path="admin/data-management" element={
              <AdminRoute>
                <DataManagementPage />
              </AdminRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
