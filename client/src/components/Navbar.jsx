import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Compass, MapPin, Briefcase, LogOut, User, Compass as LogoIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-teal-500/10 text-brand-400">
                <LogoIcon className="h-6 w-6 animate-pulse" />
              </span>
              <span className="font-outfit font-bold text-xl tracking-tight text-white">
                Roam<span className="text-brand-400">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-300 hover:text-brand-400 font-medium transition-colors">Home</Link>
            <Link to="/explore" className="text-slate-300 hover:text-brand-400 font-medium transition-colors">Explore</Link>
            {isAuthenticated && (
              <>
                <Link to="/compare" className="text-slate-300 hover:text-brand-400 font-medium transition-colors">Compare</Link>
                <Link to="/dashboard" className="text-slate-300 hover:text-brand-400 font-medium transition-colors">My Trips</Link>
              </>
            )}
            <Link to="/about" className="text-slate-300 hover:text-brand-400 font-medium transition-colors">About</Link>
          </div>

          {/* Desktop User actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-800 transition-all text-sm font-medium">
                  <User className="h-4 w-4 text-brand-400" />
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors text-sm font-medium">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link to="/planner" className="bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold px-4.5 py-2 rounded-lg text-sm transition-all duration-300 shadow-md shadow-brand-500/10">
                  Plan a Trip
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-900 px-2 pt-2 pb-4 space-y-1 sm:px-3 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
          >
            Home
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
          >
            Explore
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
              >
                Compare
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
              >
                My Trips
              </Link>
            </>
          )}
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
          >
            About
          </Link>

          <div className="pt-4 pb-2 border-t border-slate-900 px-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-slate-400 text-sm">Signed in as <span className="text-white font-medium">{user.name}</span></div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-slate-300 hover:text-white bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm shadow-md"
                >
                  Plan a Trip
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
