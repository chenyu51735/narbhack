'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Helper to find email by username
  const findEmailByUsername = (username: string): string | null => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('username_')) {
        const value = localStorage.getItem(key);
        if (value && value.toLowerCase() === username.toLowerCase()) {
          return key.replace('username_', '');
        }
      }
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignIn) {
      // Log in logic (username or email)
      let loginEmail = '';
      if (formData.email.includes('@')) {
        loginEmail = formData.email;
      } else {
        // Try to resolve username to email
        const foundEmail = findEmailByUsername(formData.email);
        if (!foundEmail) {
          setError('No account found for this username.');
          return;
        }
        loginEmail = foundEmail;
      }
      const userKey = `username_${loginEmail}`;
      const passKey = `password_${loginEmail}`;
      const username = localStorage.getItem(userKey);
      const password = localStorage.getItem(passKey);
      if (!username || !password) {
        setError('No account found. Please sign up first.');
        return;
      }
      if (formData.password !== password) {
        setError('Incorrect password.');
        return;
      }
      localStorage.setItem('authToken', 'dummy-token');
      localStorage.setItem('userEmail', loginEmail);
      localStorage.setItem('username', username);
      localStorage.setItem('isCompanion', 'false');
      localStorage.setItem('isOnline', 'false');
      window.dispatchEvent(new Event('storage'));
      router.push('/profile');
    } else {
      // Sign up logic (enforce unique username)
      if (formData.username && formData.email && formData.password) {
        // Check for unique username
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('username_')) {
            const value = localStorage.getItem(key);
            if (value && value.toLowerCase() === formData.username.toLowerCase()) {
              setError('Username already taken. Please choose another.');
              return;
            }
          }
        }
        localStorage.setItem('authToken', 'dummy-token');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('username', formData.username);
        localStorage.setItem(`username_${formData.email}`, formData.username);
        localStorage.setItem(`password_${formData.email}`, formData.password);
        localStorage.setItem('isCompanion', 'false');
        localStorage.setItem('isOnline', 'false');
        window.dispatchEvent(new Event('storage'));
        router.push('/profile');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Voxxi
            </h1>
            <p className="text-gray-600">
              Sign in to your account or create a new one to find or become a voice gaming companion
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex mb-6">
              <button
                onClick={() => setIsSignIn(true)}
                className={`flex-1 py-2 px-4 rounded-l-md font-medium transition-colors ${
                  isSignIn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => setIsSignIn(false)}
                className={`flex-1 py-2 px-4 rounded-r-md font-medium transition-colors ${
                  !isSignIn
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSignIn && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Choose a username"
                      required={!isSignIn}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </>
              )}
              {isSignIn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log In with username or email
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username or Email"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isSignIn ? "Enter your password" : "Create a password"}
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`w-full text-white py-2 px-4 rounded-md transition-colors ${
                  isSignIn
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSignIn ? 'Log In' : 'Create Account'}
              </button>
            </form>
            {error && <div className="text-red-600 text-center mt-2">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
} 