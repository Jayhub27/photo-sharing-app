import { layout } from './ui.js'

export function loginPage(_apiBase: string): string {
  const body = `
<div id="toast-container" aria-live="polite" role="status"></div>
<div class="auth-wrap">
  <a class="auth-back" href="/"><i class="ico ico-chevr"></i>Back</a>
  <div class="auth-card">
    <div class="auth-logo"><i class="ico ico-camera"></i></div>
    <div class="auth-title">Welcome back</div>
    <div class="auth-sub">Manage and sell your photo collections.</div>
    <form id="loginForm">
      <div class="auth-field">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div class="auth-field">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Your password" autocomplete="current-password" required>
      </div>
      <button class="btn auth-btn" type="submit">Log in</button>
    </form>
    <div class="auth-footer">New here? <a href="/signup">Sign up</a></div>
  </div>
</div>
`

  const script = `
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Login failed'); }
    const { user } = await res.json();
    toast('Welcome back, ' + user.name, 'success');
    setTimeout(() => window.location.href = '/', 400);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false; btn.innerHTML = 'Log in';
  }
});
`

  return layout('Log in \u00b7 Take the shot', '', body, script)
}

export function signupPage(_apiBase: string): string {
  const body = `
<div id="toast-container" aria-live="polite" role="status"></div>
<div class="auth-wrap">
  <a class="auth-back" href="/"><i class="ico ico-chevr"></i>Back</a>
  <div class="auth-card">
    <div class="auth-logo"><i class="ico ico-camera"></i></div>
    <div class="auth-title">Create your account</div>
    <div class="auth-sub">Sharing is free. Add a price whenever you want to sell.</div>
    <form id="signupForm">
      <div class="auth-field">
        <label for="name">Name</label>
        <input type="text" id="name" placeholder="Your name" autocomplete="name" required>
      </div>
      <div class="auth-field">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div class="auth-field">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="At least 8 characters" autocomplete="new-password" required>
      </div>
      <button class="btn auth-btn" type="submit">Create account</button>
    </form>
    <div class="auth-footer">Already have an account? <a href="/login">Log in</a></div>
  </div>
</div>
`

  const script = `
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name, email, password }) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Sign up failed'); }
    const { user } = await res.json();
    toast('Welcome, ' + user.name, 'success');
    setTimeout(() => window.location.href = '/', 400);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false; btn.innerHTML = 'Create account';
  }
});
`

  return layout('Sign up \u00b7 Take the shot', '', body, script)
}
