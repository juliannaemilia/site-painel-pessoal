# Security audit — Supabase + Vercel

## Database

- RLS is enabled on every public application table.
- Authenticated users can CRUD only rows whose `user_id = auth.uid()`.
- Anonymous users can only read rows explicitly marked `is_public = true` in links, spreadsheets and files.
- Public queries use explicit column projections and do not return `user_id`.
- The profile trigger is `security definer` with an empty `search_path` and is not exposed as an RPC.
- Username format is enforced in PostgreSQL and uniqueness is case-insensitive.
- Authenticated clients can update only `full_name` and `avatar_url` in `profiles`.

## Authentication

- Production must have Supabase configured. The demo authentication path is development-only.
- Auth state is synchronized through `onAuthStateChange`.
- If Supabase email confirmation is enabled, this username-only application cannot complete signup because it uses an internal synthetic email. Either collect a real email and implement verification, or deliberately disable email confirmation and enable stronger bot/abuse protections.
- The current password-recovery page is informational/admin-assisted; it does not actually reset a password.

## Supabase Dashboard before launch

1. Configure the production Site URL and redirect URLs.
2. Decide deliberately whether email confirmation is enabled. For the current username-only design, it must be disabled for signup to work.
3. Enable CAPTCHA / bot protection for sign-up and sign-in.
4. Set a strong password policy and enable leaked-password protection when available on the project plan.
5. Run Database > Security Advisor.
6. Never put a `service_role` / secret key in Vite environment variables or browser code.
7. Test the RLS policies with both `anon` and `authenticated` sessions before launch.
