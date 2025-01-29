import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ReasoningResults from './pages/ReasoningResults';
import './App.css';

const App: React.FC = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <Router>
      <div className="flex h-screen">
        {/* Side Navigation */}
        <nav 
          className={`
            fixed inset-y-0 left-0 transform 
            ${isSideNavOpen ? 'translate-x-0' : '-translate-x-full'}
            w-64 
            bg-gradient-to-br from-indigo-800 via-purple-800 to-pink-800 
            text-white 
            transition-transform duration-300 ease-in-out 
            z-50 md:relative md:translate-x-0
            shadow-2xl
          `}
        >
          <div className="p-5">
            <h2 className="text-3xl font-extrabold mb-5 
              bg-clip-text text-transparent 
              bg-gradient-to-r from-pink-500 to-purple-500
              animate-gradient-x
            ">
              Whimsical Idea Keeper
            </h2>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="
                    block py-2 px-3 
                    bg-white bg-opacity-10 hover:bg-opacity-20 
                    rounded transition 
                    transform hover:scale-105 
                    hover:shadow-lg
                  "
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/reasoning-results" 
                  className="
                    block py-2 px-3 
                    bg-white bg-opacity-10 hover:bg-opacity-20 
                    rounded transition 
                    transform hover:scale-105 
                    hover:shadow-lg
                  "
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                    Reasoning Results
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleSideNav} 
          className="
            fixed top-4 left-4 z-50 
            md:hidden 
            bg-gradient-to-r from-pink-500 to-purple-500 
            text-white 
            p-2 rounded-full 
            shadow-lg 
            hover:scale-110 
            transition-transform
          "
        >
          {isSideNavOpen ? 'Close' : 'Menu'}
        </button>

        {/* Main Content Area */}
        <main 
          className={`
            flex-1 p-5 
            ${isSideNavOpen ? 'md:ml-64' : 'md:ml-0'}
            transition-all duration-300
          `}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/reasoning-results" element={<ReasoningResults />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;