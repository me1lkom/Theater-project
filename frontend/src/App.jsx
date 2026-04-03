import React from "react";
import "./App.css";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/userPages/MainPage';
import PlayPage from "./pages/userPages/PlayPage";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/play/:id" element={<PlayPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
