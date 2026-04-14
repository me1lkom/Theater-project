import React, { useEffect } from "react";
import "./App.css";
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


function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate()
  }, []);


  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/play/:id" element={<PlayPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/panorama" element={<PanoramaPage />} />
          <Route path="/statistics" element={
            <AdminRoute>
              <StatisticsPage />
            </AdminRoute>
          } />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
