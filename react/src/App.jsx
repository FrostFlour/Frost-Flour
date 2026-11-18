import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from './api/auth';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

function FieldIcon({ type }) {
  if (type === 'email') {
    return <span className="field-icon" aria-hidden="true">✉</span>;
  }

  if (type === 'phone') {
    return <span className="field-icon" aria-hidden="true">⌕</span>;
  }

  return <span className="field-icon lock-icon" aria-hidden="true">▣</span>;
}

function BakeryIllustration() {
  return (
    <div className="bakery-illustration" aria-hidden="true">
      <span className="confetti confetti-one" />
      <span className="confetti confetti-two" />
      <span className="confetti confetti-three" />
      <span className="confetti confetti-four" />
      <span className="balloon balloon-purple" />
      <span className="balloon balloon-peach" />
      <span className="balloon balloon-lilac" />
      <div className="cake-plate" />
      <div className="cake-croissant croissant-one" />
      <div className="cake-croissant croissant-two" />
      <div className="cupcake">
        <div className="cupcake-cherry" />
        <div className="cupcake-frosting frosting-top" />
        <div className="cupcake-frosting frosting-middle" />
        <div className="cupcake-frosting frosting-bottom" />
        <div className="cupcake-wrapper"><span /><span /><span /><span /></div>
      </div>
      <div className="macaron" />
      <div className="cake-stand" />
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
  };

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser({ email: formData.email, password: formData.password });
        // An Agent goes to the Agent space (US-08/11/14), a Client to the catalog
        navigate(data.user.role === 'Agent' ? '/agent' : '/catalog');
        return;
      }

      await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setFormData(initialFormData);
      setIsLogin(true);
      setSuccess('Account created. You can now log in.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="brand-panel">
        <div className="brand-lockup">
          <div className="brand-mark">🧁</div>
          <div>
            <h1>Frost &amp; Flour</h1>
            <p>A LITTLE EVERYDAY CELEBRATION</p>
          </div>
        </div>

        <div className="brand-copy">
          <span className="eyebrow">FRESH BAKES. BIG SMILES.</span>
          <h2>A little sweetness. A lot of happiness.</h2>
          <p>Your favorite treats, freshly baked and ready to make any day feel like a celebration.</p>
        </div>

        <BakeryIllustration />
        <p className="brand-footer">Made with care. Sprinkled with joy.</p>
      </section>

      <section className="form-panel">
        <div className="auth-card">
          <div className="auth-tabs">
            <button type="button" className={isLogin ? 'active' : ''} onClick={() => switchMode(true)}>Log in</button>
            <button type="button" className={!isLogin ? 'active' : ''} onClick={() => switchMode(false)}>Sign up</button>
          </div>

          <div className="form-heading">
            <h2>{isLogin ? 'Welcome back, sweet tooth!' : 'Create your account'}</h2>
            <p>{isLogin ? 'Log in for your next little box of happiness.' : 'Join us to start ordering delicious treats.'}</p>
          </div>

          {error && <div className="message error-message"><span>!</span>{error}</div>}
          {success && <div className="message success-message"><span>✓</span>{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="name-fields">
                <label>First name<input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Sarah" required /></label>
                <label>Last name<input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Benali" required /></label>
              </div>
            )}

            <label>
              Email address
              <div className="input-wrap"><FieldIcon type="email" /><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="sarah.benali@email.com" required /></div>
            </label>

            {!isLogin && (
              <label>
                Phone number
                <div className="input-wrap"><FieldIcon type="phone" /><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+216 XX XXX XXX" required /></div>
              </label>
            )}

            <label>
              Password
              <div className="input-wrap"><FieldIcon type="password" /><input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••••" minLength={8} required /></div>
            </label>

            {isLogin && <button type="button" className="forgot-link">Forgot password?</button>}

            <button type="submit" disabled={loading} className="submit-button">
              <span>{loading ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}</span>
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="switch-copy">
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <button type="button" onClick={() => switchMode(!isLogin)}>{isLogin ? 'Switch to Sign up' : 'Switch to Log in'}</button>
          </p>
        </div>
        <p className="form-footer">One login for pastry lovers and bakery staff.</p>
      </section>
    </main>
  );
}
