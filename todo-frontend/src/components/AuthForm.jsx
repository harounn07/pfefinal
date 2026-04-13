import React from "react";

const AuthForm = ({
  title,
  subtitle,
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
  loading,
  error,
  buttonText,
  footerText,
  footerLink,
  footerLinkText
}) => {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <span className="brand-mark">◆</span>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="loader" /> : buttonText}
          </button>
        </form>

        <p className="auth-switch">
          {footerText} <a href={footerLink}>{footerLinkText}</a>
        </p>

      </div>
    </div>
  );
};

export default AuthForm;