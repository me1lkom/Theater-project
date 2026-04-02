import React from "react";
import "./App.css";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/userPages/MainPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
