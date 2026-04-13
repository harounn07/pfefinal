import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Login failed');
        return;
      }

      login(data.token, data.user);
      navigate('/');

    } catch {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your account"
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      buttonText="Sign in"
      footerText="No account?"
      footerLink="/register"
      footerLinkText="Create one"
    />
  );
}