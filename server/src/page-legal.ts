import { layout, type PageMeta } from './ui.js'

export function privacyPage(meta: PageMeta): string {
  const body = `
<a class="skip-link" href="#main">Skip to content</a>
<div class="topbar">
  <div class="topbar-inner">
    <a class="nav-logo" href="/"><div class="logo-icon"><i class="ico ico-camera"></i></div><div class="logo-text">Take the shot</div></a>
  </div>
</div>
<div class="wrap" id="main">
  <article class="legal">
    <h1>Privacy policy</h1>
    <p class="updated">Last updated: 7 November 2026</p>

    <p>Take the shot is a photo-sharing app you can run yourself. This policy describes
    the hosted service at <strong>take-the-shot-api.vercel.app</strong>. If you deploy your
    own copy, the operator of that copy decides what it stores and is responsible for it.</p>

    <h2>What we collect</h2>
    <ul>
      <li><strong>Account:</strong> your name, email address and a bcrypt password hash. Passwords are never stored in plain text.</li>
      <li><strong>Photos and collections:</strong> the files you upload, generated thumbnails, dimensions, filenames, collection names, prices and expiry dates.</li>
      <li><strong>Sessions:</strong> a random session token in an HTTP-only cookie, plus its creation time.</li>
      <li><strong>Purchases:</strong> buyer email, amount, currency, status and Stripe identifiers. Card details go directly to Stripe and never reach our server.</li>
      <li><strong>Feedback:</strong> the message you send through the feedback box, the page it came from and basic display settings.</li>
      <li><strong>Errors:</strong> if the operator configures Sentry or an alert webhook, error details may be sent there.</li>
    </ul>

    <h2>What we do not collect</h2>
    <ul>
      <li>No advertising identifiers, tracking pixels or third-party analytics by default.</li>
      <li>No precise location, contacts or device advertising ID.</li>
      <li>No card numbers or bank details.</li>
    </ul>

    <h2>Cookies and local storage</h2>
    <p>After login we set one HTTP-only session cookie. The browser may also store theme,
    view, onboarding and background preferences in local storage. There are no advertising
    or cross-site cookies.</p>

    <h2>Third parties</h2>
    <p>Depending on how the service is deployed, data may be processed by:</p>
    <ul>
      <li><strong>Supabase</strong> for the database and private object storage.</li>
      <li><strong>Stripe</strong> for checkout, receipts and seller payouts.</li>
      <li><strong>Vercel</strong> or another host for serving the app.</li>
      <li><strong>Sentry</strong> or an alert webhook, only when configured.</li>
    </ul>
    <p>Each provider processes data under its own terms.</p>

    <h2>Retention and deletion</h2>
    <ul>
      <li>Collections can be set to auto-delete after 1 to 3650 days. The sweeper removes the photos, members and purchase records.</li>
      <li>You can delete individual photos or a whole collection at any time.</li>
      <li>To delete an account, contact the operator through the project issue tracker.</li>
      <li>Some purchase records may be kept where tax or accounting rules require it.</li>
    </ul>

    <h2>Security</h2>
    <p>Photos live in a private storage bucket and every image byte is streamed through an
    access check. Passwords are hashed with bcrypt, sessions are HTTP-only, and production
    traffic uses HTTPS. No system is perfect; please report a problem through the issue
    tracker instead of testing it against other people&rsquo;s collections.</p>

    <h2>Children</h2>
    <p>The service is not intended for children under 13.</p>

    <h2>Changes</h2>
    <p>If this policy changes, the date at the top changes with it.</p>

    <h2>Contact</h2>
    <p>Questions or deletion requests:
    <a href="https://github.com/Jayhub27/photo-sharing-app/issues" rel="noopener noreferrer">open an issue on GitHub</a>.</p>
  </article>
</div>`

  return layout(meta, body, '')
}

export function notFoundPage(meta: PageMeta): string {
  const body = `
<a class="skip-link" href="#main">Skip to content</a>
<div class="topbar">
  <div class="topbar-inner">
    <a class="nav-logo" href="/"><div class="logo-icon"><i class="ico ico-camera"></i></div><div class="logo-text">Take the shot</div></a>
  </div>
</div>
<div class="wrap" id="main">
  <div class="notfound">
    <div class="code">404</div>
    <h1>This page went missing</h1>
    <p>The link may be old, the collection may have expired, or the address has a typo.
    Your own collections are still where you left them.</p>
    <div class="actions">
      <a class="btn" href="/">Go to collections</a>
      <a class="btn outline" href="/signup">Create an account</a>
    </div>
  </div>
</div>`

  return layout(meta, body, '')
}
