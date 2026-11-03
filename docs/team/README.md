# Working with a team (and their Claude sessions)

How it works: a teammate asks their own Claude to make a change on a **branch** and open a
**pull request** (a proposed change). The automatic checks run. **You** read a plain-language
summary, approve, and merge. Teammates can never change the live app, the database, the
store listing or your keys.

---

## Part 1. One-time setup (the owner, in GitHub, about 15 minutes)

Do this on a laptop if you can. Open your repo on github.com → **Settings**.

1. **Keep the repo private.** Settings → General → scroll to the bottom → "Danger zone": the
   visibility must say **Private**.
2. **Turn on the protection for `main`.**
   Settings → **Rules → Rulesets → New ruleset → New branch ruleset**.
   - Ruleset name: `Protect main`. Enforcement status: **Active**.
   - Target branches: **Add target → Include default branch**.
   - Tick: **Restrict deletions** and **Block force pushes**.
   - Tick **Require a pull request before merging**, then inside it:
     - Required approvals: **1**
     - **Dismiss stale pull request approvals when new commits are pushed**
     - **Require review from Code Owners**
   - Tick **Require status checks to pass**, press **Add checks**, type `Checks` and pick it
     (the `Checks` job from `.github/workflows/ci.yml`; it only appears after the workflow has
     run once, so open a small test pull request first if it isn't listed).
   - **Bypass list:** add yourself (**Repository admin**) so you can still work on your own
     changes and in an emergency. Teammates are not on this list.
   - Press **Create**.
3. **Turn on GitHub's own security tools.** Settings → **Code security** (or "Advanced
   Security"): enable **Dependabot alerts**, **Dependabot security updates**, **Secret scanning**
   and **Push protection**.
4. **Workflows.** Settings → **Actions → General**: under "Fork pull request workflows" choose
   **Require approval for all external contributors**, and under "Workflow permissions" choose
   **Read repository contents and packages permissions**.
5. **Everyone uses two-factor sign-in** on GitHub. Make that a condition of joining.

## Part 2. Adding a teammate

1. They create a GitHub account with **two-factor sign-in**, and send you the username.
2. They sign the contributor agreement (`docs/team/contributor-agreement-DRAFT.md`, after a
   lawyer has looked at it).
3. Settings → **Collaborators → Add people** → their username → role **Write** (never Admin).
4. They use their **own Claude account**. Check Anthropic's current plans: your plan doesn't
   cover them unless you have a team plan.
5. They open **claude.ai/code**, pick this repository, and start with this message:

   > Read CLAUDE.md in this repository and follow it exactly. Work on a new branch named
   > team/<my-name>/<topic>. When the work is done, run the four checks, then open a pull
   > request using the template. Never merge it, and never push to main.

6. **Other services** (only if they need them, and with the smallest role):
   - **Lovable website:** invite them to the workspace as an editor; *you* press Publish.
   - **Supabase:** don't give access. Database changes come as files in a pull request and you apply them.
   - **Google Play Console:** don't give access to teammates who write code. For a tester or support
     person use Users and permissions with "View app information" only.
   - **Never share:** your upload key, Supabase service key, Firebase service-account file,
     RevenueCat secret, or any email password.

## Part 3. How you approve a change (on your phone)

1. GitHub app → **Pull requests** → open it. At the bottom, `Checks` must be **green**. Red
   means don't merge; ask the teammate's Claude to fix it.
2. Read the top of the description: it says what changed, why, and which boxes were ticked.
3. **Ask me (Claude) to review it for you:** *"Review pull request #12 and explain it in plain
   English: what changed, risks, whether it touches privacy, the database, payments or Wolof
   text."* I'll answer in plain language.
4. Look for these before you approve:
   - **Database (`supabase/`):** I check it for security first; then I (or you) apply it after merging.
   - **New personal data:** the privacy page and Data safety notes must have changed too.
   - **Wolof text:** don't merge until your reviewer has approved the listed phrases.
   - **Anything in `.github/`, `android/`, or payments:** read these twice or ask me.
5. **Approve → Merge.** The change is on `main` but **not live**: nothing reaches users until
   you build a signed release and upload it (or press Publish on the website).

## Part 3b. Team members inside the app (owner console → Team tab)
Not everyone who helps needs GitHub. Invite them under **Owner console → Team** with a role.
They create an ordinary account in the app with that email, then see **Profile → Team console**.

| Role | Can do | Cannot do |
|---|---|---|
| admin | everything in the console day to day, reads the log | delete accounts or organisations, free access (grants), manage the team |
| support | overview, look up learners and organisations, handle problem reports | suspend or delete, anything with money |
| reviewer | read problem reports and missed words, mark reports done | see people |
| analyst | overview numbers and missed words | see any personal details |

The database enforces this, not the screen. Anything not listed stays owner-only. The Log
shows who did each action. Pause or remove a person and access ends immediately.
**Two-person rule.** Admins and support can't delete accounts or organisations (support can't
suspend either). They press "Ask owner to…", give a reason, and it waits in the **Requests** tab
until you approve. Approving does it at once.

**Notices tab** (owner and admin): post an announcement shown on everyone's Learn screen, in
up to five languages, between two dates; or **pause** friends, duels, voice recording,
Supporter or "Report a problem" for everyone in an emergency. Apps check within an hour.
A pause can only switch off what the app already has.

Needs migrations `20261103000000_staff_roles.sql` then
`20261103000100_notices_switches_approvals.sql` (you apply them, in that order). The tests
`supabase/tests/staff_roles_test.sql` and `notices_switches_approvals_test.sql` should print
"… TESTS PASSED (rolled back)".

## Part 4. Releases stay with you
Only you (or your Claude session, with your key) build, sign and upload to Google Play. After
each release, test it on your phone, and roll out to a small percentage first in Play Console.

## Part 5. When someone leaves
Remove them under Settings → Collaborators, remove them from Lovable, Supabase and Play
Console if they were added, and **rotate** (replace) any secret they may have seen.

## What the automatic checks catch, and what they don't
They catch: type errors, lint errors, failing tests, a broken build, and committed secrets.
They cannot judge: whether a feature is a good idea, whether Wolof is correct, or whether a
change is unsafe in a way no test covers. That is what your approval, the owner-only
areas and the staged rollout are for.
