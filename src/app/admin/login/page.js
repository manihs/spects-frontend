'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        isAdmin: 'true', // Specify this is an admin login
      });
      
      if (result.error) {
        setError('Invalid credentials');
      } else {
        // The role validation is handled by the backend now
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('An error occurred during sign in');
    }
  };

  return (
    <div className="admin-login-container">
      <h1>Admin Login</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}