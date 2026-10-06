# Agent notes

## Android cloud testing (Ramus and similar services)

Take the shot's Android APK is tested in hosted emulators (Ramus during alpha).
Whenever a task involves uploading builds, connecting the repo, or sharing a
device session with one of these services, always apply this checklist first.

### Always

- Use **test accounts and test data** only. Never sign in with real user,
  production, or personal credentials on a shared/virtual device.
- Assume **anything on the device screen is visible to the service** (including
  analytics session replay) and to anyone holding a share link.
- Keep **production secrets out of the repo, build env, and APK**. The only env
  var needed for cloud testing is `EXPO_PUBLIC_API_BASE` (public by design).
- Treat **share links as bearer credentials**: never post them publicly, share
  only with intended reviewers, and revoke them when the session ends.
- Prefer **debug or staging-targeted builds** for interactive sessions.
- Keep these services a **supplement, not the only test path**. They are alpha
  services provided "as is" and can be discontinued with notice.
- Data may be processed in the **US**; do not upload anything subject to
  stricter data-residency requirements.

### Never

- Install VPNs, proxies, or tunnels on the hosted device, or use it as a
  general-purpose phone (games, social media, streaming, messaging). This
  violates the acceptable use policy.
- Create multiple accounts or share links to get around free-tier limits.
- Leave a session running unattended when it holds access to a paid API or
  production backend.

### Before connecting GitHub

- Verify the GitHub App only requests the repositories intended for previews.
- Confirm no repository secrets are consumed by the preview build workflow.
