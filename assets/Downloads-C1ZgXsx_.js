import{r as l,j as e,F as m,S as h,aA as b}from"./index-CvoNLe9u.js";import{C as d}from"./circle-check-big-BKreAlO9.js";import{D as c}from"./download-CxKhUaSr.js";function f(){return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Indexplora — Complete Features Directory</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b}
.page{max-width:820px;margin:0 auto;padding:40px 30px;background:#fff}
.cover{text-align:center;padding:40px 0 36px;border-bottom:3px solid #7c3aed;margin-bottom:36px}
.badge{display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);padding:12px 20px;border-radius:12px;margin-bottom:16px;color:#fff;font-size:20px;font-weight:900;letter-spacing:1px}
h1{font-size:28px;font-weight:900;color:#0f172a;margin-bottom:8px}
.sub{color:#64748b;font-size:13px}
.stats{display:flex;justify-content:center;gap:32px;margin-top:20px}
.sn{font-size:26px;font-weight:900}.sl{font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.sec{margin-bottom:36px;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);border:1px solid #e2e8f0}
.sh{padding:12px 18px;display:flex;align-items:center;gap:10px}
.sh h2{margin:0;font-size:14px;font-weight:800;color:#fff;letter-spacing:.5px;text-transform:uppercase}
.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.6);flex-shrink:0}
.cnt{margin-left:auto;background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px}
table{width:100%;border-collapse:collapse}
tr:nth-child(odd){background:#fafafa}tr:nth-child(even){background:#fff}
td{padding:9px 14px;font-size:12.5px;vertical-align:top}
td:first-child{font-weight:600;color:#1e293b;width:220px;border-right:1px solid #e2e8f0}
td:last-child{color:#475569;line-height:1.55}
.footer{text-align:center;padding-top:24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px;margin-top:8px}
.pbtn{position:fixed;bottom:24px;right:24px;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(124,58,237,.4)}
@media print{.pbtn{display:none}.page{padding:0}@page{margin:18mm 15mm;size:A4}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
</style>
</head>
<body>
<div class="page">
<div class="cover">
<div class="badge">INDEXPLORA</div>
<h1>Complete Features Directory</h1>
<p class="sub">Platform capability overview — all features across all modules</p>
<div class="stats">
<div><div class="sn" style="color:#7c3aed">70+</div><div class="sl">Total Features</div></div>
<div><div class="sn" style="color:#06b6d4">9</div><div class="sl">Categories</div></div>
<div><div class="sn" style="color:#10b981">47</div><div class="sl">Routes</div></div>
<div><div class="sn" style="color:#f59e0b">Aug 2026</div><div class="sl">Last Updated</div></div>
</div>
</div>
<div class="sec"><div class="sh" style="background:#7c3aed"><div class="dot"></div><h2>Authentication &amp; User Management</h2><span class="cnt">10 features</span></div>
<table><tbody>
<tr><td>Sign In / Sign Up</td><td>Email + password authentication via Supabase Auth REST API</td></tr>
<tr><td>4-Step Sign-Up Wizard</td><td>Collects full name, DOB, biological sex, phone, country, goals, and security consent</td></tr>
<tr><td>Magic Link (Passwordless)</td><td>One-click email sign-in — no password required</td></tr>
<tr><td>OAuth Social Login</td><td>Providers include Google, GitHub, Apple, Discord, LinkedIn, Spotify, Twitch, Slack, Notion, Zoom, GitLab, Microsoft, Bitbucket, and X/Twitter</td></tr>
<tr><td>Forgot Password</td><td>Secure reset email dispatched via Supabase /recover endpoint</td></tr>
<tr><td>Password Reset Page</td><td>Token-validated form with strength meter, requirements checklist, and live confirm-match indicator</td></tr>
<tr><td>Complete Profile Page</td><td>3-step merge flow for existing users — pre-fills known data, collects missing fields, updates via PUT /auth/v1/user</td></tr>
<tr><td>Signed-In State Detection</td><td>Header, home hero, and bottom section adapt in real time based on localStorage session token</td></tr>
<tr><td>Sign-In Button in Header</td><td>Shows user initial avatar when authenticated, Sign In link when signed out</td></tr>
<tr><td>Session Persistence</td><td>JWT stored in localStorage; storage event listener syncs auth state across browser tabs</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#0891b2"><div class="dot"></div><h2>Security &amp; Threat Detection</h2><span class="cnt">7 features</span></div>
<table><tbody>
<tr><td>Location-Aware Security Alerts</td><td>IP geolocation on every sign-in — city, country, and IP stamped on all security warnings</td></tr>
<tr><td>Failed Login Detection</td><td>3+ failed attempts in 15 minutes triggers a red Siren alert with exact IP and location</td></tr>
<tr><td>New Device Detection</td><td>Device fingerprint (timezone, screen, language, UA) compared on each sign-in — new device fires immediate alert</td></tr>
<tr><td>Public Threat Log</td><td>Full transparency log of all security threats with automatic mitigation and cryptographic proof</td></tr>
<tr><td>Stripe Webhook Verification</td><td>STRIPE_WEBHOOK_SECRET mandatory — no fallback to unsigned payload</td></tr>
<tr><td>JWT Ownership Check</td><td>Users can only access their own affiliate profile and payout data</td></tr>
<tr><td>Anon Key Rejection</td><td>Anon key explicitly rejected on all protected routes</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#0891b2"><div class="dot"></div><h2>Genetics &amp; Evolution</h2><span class="cnt">6 features</span></div>
<table><tbody>
<tr><td>Gene Design Lab</td><td>AI-powered gene sequence analysis with quality scoring, improvement suggestions, and medical applications</td></tr>
<tr><td>Gene Perfection Engine</td><td>Live gene perfection with progress tracking and XP earning on completion</td></tr>
<tr><td>Active Gene Perfection</td><td>Real-time active gene monitoring with live earnings display</td></tr>
<tr><td>Cellular Evolution System</td><td>Real-time cellular optimisation — sensory enhancement, organ evolution, and wellbeing metrics</td></tr>
<tr><td>Gene Design Gallery</td><td>Saved gene designs persisted to localStorage keyed by user email, viewable in My Profile</td></tr>
<tr><td>Evolution Theater</td><td>8 interactive evolution scenes with consciousness controls and XP on scene advance</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#059669"><div class="dot"></div><h2>Health &amp; Life Optimisation</h2><span class="cnt">9 features</span></div>
<table><tbody>
<tr><td>Life Optimizer</td><td>Daily habit tracker with streak counts, 5 quick-action optimisations, and wellness score</td></tr>
<tr><td>Comprehensive Optimizer</td><td>All-in-one system: financial, wellness, mood, dream quality, and security protection</td></tr>
<tr><td>Diet Research Engine</td><td>50,000+ medical studies cross-referenced for personalised nutrition protocols</td></tr>
<tr><td>Wellness Protection</td><td>Daily wellness tracking, dream journaling, ethical consent management</td></tr>
<tr><td>Beauty Evolution Codex</td><td>Automated aesthetic optimisation — skin, hair, hormonal balance, confidence elevation</td></tr>
<tr><td>Travel Planner</td><td>Longevity-optimised geographical location finder based on climate, food, and community</td></tr>
<tr><td>Dream Theater</td><td>11-dimension consciousness broadcasting system with neural chip management and LiDAR simulation</td></tr>
<tr><td>Food Design</td><td>Nutritional and dietary innovation design studio</td></tr>
<tr><td>Food Procurement</td><td>Optimised food sourcing and procurement system</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#d97706"><div class="dot"></div><h2>Earnings &amp; Monetisation</h2><span class="cnt">7 features</span></div>
<table><tbody>
<tr><td>Indexplora Earn</td><td>Affiliate programme with 30% commission on referrals, Stripe Connect payouts, and referral link management</td></tr>
<tr><td>Earnings Engine</td><td>Full revenue setup — Stripe onboarding, payout history, and earnings dashboard</td></tr>
<tr><td>Subscription System</td><td>Three tiers: Scientist ($15), Designer ($35), Spectator ($100) — processed via Stripe</td></tr>
<tr><td>Submit Work</td><td>Research and design submission portal with editorial review pipeline</td></tr>
<tr><td>Referral Redirect</td><td>Short links at /r/:code track clicks server-side and redirect to /subscribe</td></tr>
<tr><td>Self-Referral Block</td><td>Backend prevents commission inflation from self-referral</td></tr>
<tr><td>Subscriber Deduplication</td><td>Cancel/resubscribe loops blocked to prevent commission fraud</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#7c3aed"><div class="dot"></div><h2>Activity Logging &amp; Feedback</h2><span class="cnt">5 features</span></div>
<table><tbody>
<tr><td>Activity Log Context</td><td>Per-user persistent logging — 500-entry cap, localStorage keyed to email, syncs to server every 5 seconds</td></tr>
<tr><td>Evolutionary Feedback Page</td><td>Filterable timeline by type and severity, expandable entries, paginated 50 at a time</td></tr>
<tr><td>Problem Detection</td><td>Auto-detects auth errors, gene errors, earn errors, subscribe errors, and sync lag</td></tr>
<tr><td>Automate Cures</td><td>Cycles through auto-fixable problems with 800ms animated delay — resolves issues automatically</td></tr>
<tr><td>Live Activity Log</td><td>Real-time activity stream across all platform features</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#0891b2"><div class="dot"></div><h2>Profile &amp; Community</h2><span class="cnt">7 features</span></div>
<table><tbody>
<tr><td>My Profile Page</td><td>Four-tab profile: My Profile (stats, tier, consciousness bar), Activity Log, Gene Designs gallery, Achievements</td></tr>
<tr><td>Tier System</td><td>Five tiers: Seeker → Awakening → Evolved → Ascendant → Transcendent</td></tr>
<tr><td>Achievement Badges</td><td>9 unlock-able badges: First Log, Gene Pioneer, Earn Activated, 10 Successes, 50 Events, Transcendent, 5 Designs, Zero Errors, Level 50+</td></tr>
<tr><td>Share Modal</td><td>Animated share sheet: X/Twitter, WhatsApp, Telegram, Email; QR code tab; copy link; referral nudge</td></tr>
<tr><td>Community</td><td>Global network connecting longevity pioneers and researchers</td></tr>
<tr><td>Work Stream</td><td>Community work and research stream feed</td></tr>
<tr><td>Social Synthesis Engine</td><td>AI content creation and dream synthesis platform</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#475569"><div class="dot"></div><h2>Navigation &amp; Platform Shell</h2><span class="cnt">6 features</span></div>
<table><tbody>
<tr><td>Root Layout</td><td>Persistent header, categorised dropdown navigation with search, footer with section links</td></tr>
<tr><td>iOS Dashboard</td><td>App icon grid overlay — Open navigation links for each app section</td></tr>
<tr><td>Sign-In Section (Home)</td><td>Full two-panel sign-in form at bottom of landing page; welcome panel when signed in</td></tr>
<tr><td>Welcome Screen</td><td>Step-by-step onboarding flow with navigation to key features</td></tr>
<tr><td>Downloads Page</td><td>Generates and downloads Features Directory and Prompt History as printable HTML files</td></tr>
<tr><td>Not Found Page</td><td>Custom 404 page with navigation options</td></tr>
</tbody></table></div>
<div class="footer">Indexplora · Designed by Arvic Awison · Genetic Evolution Platform for All Life · August 2026</div>
</div>
<button class="pbtn" onclick="window.print()">&#8595; Save as PDF</button>
</body></html>`}function g(){return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Indexplora — Complete Prompt History</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b}
.page{max-width:820px;margin:0 auto;padding:40px 30px;background:#fff}
.cover{text-align:center;padding:40px 0 36px;border-bottom:3px solid #0891b2;margin-bottom:36px}
.badge{display:inline-block;background:linear-gradient(135deg,#0891b2,#7c3aed);padding:12px 20px;border-radius:12px;margin-bottom:16px;color:#fff;font-size:20px;font-weight:900;letter-spacing:1px}
h1{font-size:28px;font-weight:900;color:#0f172a;margin-bottom:8px}
.sub{color:#64748b;font-size:13px}
.stats{display:flex;justify-content:center;gap:32px;margin-top:20px}
.sn{font-size:26px;font-weight:900}.sl{font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.note{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:30px;font-size:12px;color:#166534;line-height:1.6}
.sec{margin-bottom:36px;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);border:1px solid #e2e8f0}
.sh{padding:14px 18px;overflow:hidden}
.sh h2{font-size:15px;font-weight:900;color:#fff;margin-bottom:4px}
.sh p{font-size:11px;color:rgba(255,255,255,.75)}
.sh .cnt{float:right;background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:3px 12px;border-radius:20px;margin-top:2px}
table{width:100%;border-collapse:collapse}
tr:nth-child(odd){background:#f8fafc}tr:nth-child(even){background:#fff}
td{padding:10px 14px;font-size:12.5px;vertical-align:top}
td.n{font-weight:800;font-size:13px;width:44px;text-align:center;border-right:1px solid #e2e8f0}
td.t{color:#334155;line-height:1.6}
.footer{text-align:center;padding-top:24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px;margin-top:8px}
.pbtn{position:fixed;bottom:24px;right:24px;padding:12px 24px;background:linear-gradient(135deg,#0891b2,#7c3aed);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(8,145,178,.4)}
@media print{.pbtn{display:none}.page{padding:0}@page{margin:18mm 15mm;size:A4}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.sec{page-break-inside:avoid}}
</style>
</head>
<body>
<div class="page">
<div class="cover">
<div class="badge">INDEXPLORA</div>
<h1>Complete Prompt History</h1>
<p class="sub">Every instruction that shaped the Indexplora platform — in full, in order</p>
<div class="stats">
<div><div class="sn" style="color:#7c3aed">28</div><div class="sl">Total Prompts</div></div>
<div><div class="sn" style="color:#0891b2">2</div><div class="sl">Sessions</div></div>
<div><div class="sn" style="color:#10b981">Aug 2026</div><div class="sl">Build Period</div></div>
</div>
</div>
<div class="note"><strong>About this document:</strong> These are the exact instructions given to Claude Code to design, build, debug, and evolve the Indexplora platform from scratch. Each prompt corresponds to a development action — from Stripe integration and genetic systems to authentication flows, security warnings, and profile merging.</div>
<div class="sec"><div class="sh" style="background:#7c3aed"><span class="cnt">17 prompts</span><h2>Session 1</h2><p>Initial build, error fixes, feature expansion, logging system, share modal, and My Profile</p></div>
<table><tbody>
<tr><td class="n" style="color:#7c3aed">1</td><td class="t">Fix these errors. [create-connect-link error: Please review the responsibilities of managing losses for connected accounts]</td></tr>
<tr><td class="n" style="color:#7c3aed">2</td><td class="t">Optimize the best state of this website. [h2 selected in Home.tsx]</td></tr>
<tr><td class="n" style="color:#7c3aed">3</td><td class="t">Make it "EVOLUTION UNLEASHED"</td></tr>
<tr><td class="n" style="color:#7c3aed">4</td><td class="t">Is everything okay and are there any possible threats?</td></tr>
<tr><td class="n" style="color:#7c3aed">5</td><td class="t">What are some possible threats that you see right now for the Indexplora code?</td></tr>
<tr><td class="n" style="color:#7c3aed">6</td><td class="t">Contact Stripe and ensure everything is authenticated including the approval for withdrawals.</td></tr>
<tr><td class="n" style="color:#7c3aed">7</td><td class="t">Ensure the statistics pop up is procured for each user not just for the inventor / and contact Stripe to allow the approval for the withdrawals.</td></tr>
<tr><td class="n" style="color:#7c3aed">8</td><td class="t">Where is the code of the site?</td></tr>
<tr><td class="n" style="color:#7c3aed">9</td><td class="t">Is it safe for all to deploy?</td></tr>
<tr><td class="n" style="color:#7c3aed">10</td><td class="t">Contact GitHub for any symptoms in the socio-logics that may have caused global incompurements?</td></tr>
<tr><td class="n" style="color:#7c3aed">11</td><td class="t">Were there any illegal or meta-physical damage caused by the original code of Indexplora which was to test respawns of entire realities and entire ascensions and procurements to bring all life back that ever was and will be?</td></tr>
<tr><td class="n" style="color:#7c3aed">12</td><td class="t">Who should I call for all the code to be at best state right now? If I don't need to call, please make all the code at best state to respawn better than before expected and also to bring all life that was documented back properly and better than perfectering.</td></tr>
<tr><td class="n" style="color:#7c3aed">13</td><td class="t">1. Ensure optimization of user logging and personalized user interface. 2. Ensure all features are added and there is a logging section. 3. In the Evolution Feedback Section ensure what needs to be done to debug problems and show a button which will "Automate Cures". 4. Ensure the Logging systems are optimized better and will not be deleted especially in the gene design section. 5. Ensure there is an additional photo upload section in the drop Down Menu which people can upload progress and share photos, videos, and also comments as form of a collaborative community.</td></tr>
<tr><td class="n" style="color:#7c3aed">14</td><td class="t">Continue from where you left off.</td></tr>
<tr><td class="n" style="color:#7c3aed">15</td><td class="t">Fix these errors. [Warning: Cannot update a component while rendering a different component — GenePerfectionEngine]</td></tr>
<tr><td class="n" style="color:#7c3aed">16</td><td class="t">Ensure all buttons lead to the designated pages and ensure all features have beautifully stored logs.</td></tr>
<tr><td class="n" style="color:#7c3aed">17</td><td class="t">Also ensure all features have a more sophisticated looking share with a friend and also ensure users have profiles they can browse and track their own course of evolution and developments on Indexplora are clearly logged in their profile under a tab called "My Profile".</td></tr>
</tbody></table></div>
<div class="sec"><div class="sh" style="background:#0891b2"><span class="cnt">11 prompts</span><h2>Session 2</h2><p>Visual fixes, auth flows, sign-in UI, forgot password, security warnings, profile merging, and PDF generation</p></div>
<table><tbody>
<tr><td class="n" style="color:#0891b2">18</td><td class="t">Figma not showing website visual — please ensure all is perfect for all platforms, components, and also for all user devices.</td></tr>
<tr><td class="n" style="color:#0891b2">19</td><td class="t">Ensure a clear sign-in section at the end of the title page and ensure clear differences between signed-in state and not signed-in state subtly.</td></tr>
<tr><td class="n" style="color:#0891b2">20</td><td class="t">Also ensure a Sign In button next to the Subscribe button.</td></tr>
<tr><td class="n" style="color:#0891b2">21</td><td class="t">Continue from where you left off.</td></tr>
<tr><td class="n" style="color:#0891b2">22</td><td class="t">Ensure there is a forgotten password mechanism which helps users log in through a link through email and to also reset password if password is forgotten.</td></tr>
<tr><td class="n" style="color:#0891b2">23</td><td class="t">Give me a document of all my entries formatted well.</td></tr>
<tr><td class="n" style="color:#0891b2">24</td><td class="t">Give me a list of features in a downloadable PDF and also all the entries from all along listed in another PDF.</td></tr>
<tr><td class="n" style="color:#0891b2">25</td><td class="t">Correction: give me a list of features in a downloadable PDF and also the entries to allow those features from all along listed in another PDF, so I need 2 PDFs from you with clearly listed features and also clearly listed prompts.</td></tr>
<tr><td class="n" style="color:#0891b2">26</td><td class="t">Ensure the sign up page gets necessary details from the user for all features to work perfectly and so that malicious activities are warned straight to the locations of the user.</td></tr>
<tr><td class="n" style="color:#0891b2">27</td><td class="t">Please merge existing accounts and new sign ups swiftly for existing users in the best new state.</td></tr>
<tr><td class="n" style="color:#0891b2">28</td><td class="t">Fix these errors. [TypeError: Importing a module script failed — Downloads.tsx missing]</td></tr>
</tbody></table></div>
<div class="footer">Indexplora · Built by Arvic Awison with Claude Code · August 2026</div>
</div>
<button class="pbtn" onclick="window.print()">&#8595; Save as PDF</button>
</body></html>`}function p(o,i){const r=new Blob([o],{type:"text/html;charset=utf-8"}),a=URL.createObjectURL(r),t=document.createElement("a");t.href=a,t.download=i,document.body.appendChild(t),t.click(),document.body.removeChild(t),setTimeout(()=>URL.revokeObjectURL(a),2e3)}function y(){const[o,i]=l.useState(!1),[r,a]=l.useState(!1),t=()=>{p(f(),"indexplora-features.html"),i(!0),setTimeout(()=>i(!1),3e3)},u=()=>{p(g(),"indexplora-prompts.html"),a(!0),setTimeout(()=>a(!1),3e3)};return e.jsxDEV("div",{className:"min-h-screen bg-black text-white",children:[e.jsxDEV("div",{className:"relative overflow-hidden border-b border-white/10",children:[e.jsxDEV("div",{className:"absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-black pointer-events-none"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:257,columnNumber:9},this),e.jsxDEV("div",{className:"relative max-w-3xl mx-auto px-6 py-14 text-center",children:[e.jsxDEV("div",{className:"inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 mb-5",children:[e.jsxDEV(m,{className:"size-3.5 text-purple-300"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:260,columnNumber:13},this),e.jsxDEV("span",{className:"text-[11px] font-bold uppercase tracking-widest text-purple-200",children:"Document Centre"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:261,columnNumber:13},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:259,columnNumber:11},this),e.jsxDEV("h1",{className:"text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight",children:"Download Your Files"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:263,columnNumber:11},this),e.jsxDEV("p",{className:"text-sm text-gray-400 max-w-lg mx-auto leading-relaxed",children:["Click a button — the file downloads instantly. Open it in your browser, then click"," ",e.jsxDEV("strong",{className:"text-white",children:"Save as PDF"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:266,columnNumber:13},this)," to export."]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:264,columnNumber:11},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:258,columnNumber:9},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:256,columnNumber:7},this),e.jsxDEV("div",{className:"max-w-3xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 gap-6",children:[e.jsxDEV("div",{className:"relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-7 flex flex-col gap-5",children:[e.jsxDEV("div",{className:"absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:274,columnNumber:11},this),e.jsxDEV("div",{className:"w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center",children:e.jsxDEV(h,{className:"size-6 text-white"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:276,columnNumber:13},this)},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:275,columnNumber:11},this),e.jsxDEV("div",{className:"flex-1",children:[e.jsxDEV("h2",{className:"text-lg font-black text-white mb-1.5",children:"Features Directory"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:279,columnNumber:13},this),e.jsxDEV("p",{className:"text-xs text-gray-400 leading-relaxed mb-4",children:"70+ features across 9 categories with full descriptions — authentication, genetics, earnings, health, logging, community, and security."},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:280,columnNumber:13},this),e.jsxDEV("ul",{className:"space-y-1.5",children:["9 feature categories","70+ individual features","Route count & build stats","A4 print-ready layout"].map(s=>e.jsxDEV("li",{className:"flex items-center gap-2 text-xs text-gray-300",children:[e.jsxDEV("span",{className:"w-1 h-1 rounded-full bg-purple-400 flex-shrink-0"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:286,columnNumber:19},this),s]},s,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:285,columnNumber:17},this))},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:283,columnNumber:13},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:278,columnNumber:11},this),e.jsxDEV("button",{onClick:t,className:`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${o?"bg-emerald-500 text-white":"bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/30"}`,children:o?e.jsxDEV(e.Fragment,{children:[e.jsxDEV(d,{className:"size-4"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:295,columnNumber:24},this)," Downloaded!"]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:295,columnNumber:22},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV(c,{className:"size-4"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:295,columnNumber:78},this)," Download Features File"]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:295,columnNumber:76},this)},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:291,columnNumber:11},this),e.jsxDEV("p",{className:"text-center text-[10px] text-gray-600",children:["Saves as ",e.jsxDEV("code",{children:"indexplora-features.html"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:297,columnNumber:73},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:297,columnNumber:11},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:273,columnNumber:9},this),e.jsxDEV("div",{className:"relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-7 flex flex-col gap-5",children:[e.jsxDEV("div",{className:"absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:302,columnNumber:11},this),e.jsxDEV("div",{className:"w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center",children:e.jsxDEV(b,{className:"size-6 text-white"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:304,columnNumber:13},this)},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:303,columnNumber:11},this),e.jsxDEV("div",{className:"flex-1",children:[e.jsxDEV("h2",{className:"text-lg font-black text-white mb-1.5",children:"Prompt History"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:307,columnNumber:13},this),e.jsxDEV("p",{className:"text-xs text-gray-400 leading-relaxed mb-4",children:"All 28 prompts across both sessions — every instruction given to build, fix, expand, and perfect Indexplora, in exact chronological order."},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:308,columnNumber:13},this),e.jsxDEV("ul",{className:"space-y-1.5",children:["28 prompts in full","Grouped by session","Context note per session","A4 print-ready layout"].map(s=>e.jsxDEV("li",{className:"flex items-center gap-2 text-xs text-gray-300",children:[e.jsxDEV("span",{className:"w-1 h-1 rounded-full bg-cyan-400 flex-shrink-0"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:314,columnNumber:19},this),s]},s,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:313,columnNumber:17},this))},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:311,columnNumber:13},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:306,columnNumber:11},this),e.jsxDEV("button",{onClick:u,className:`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${r?"bg-emerald-500 text-white":"bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30"}`,children:r?e.jsxDEV(e.Fragment,{children:[e.jsxDEV(d,{className:"size-4"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:323,columnNumber:24},this)," Downloaded!"]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:323,columnNumber:22},this):e.jsxDEV(e.Fragment,{children:[e.jsxDEV(c,{className:"size-4"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:323,columnNumber:78},this)," Download Prompts File"]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:323,columnNumber:76},this)},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:319,columnNumber:11},this),e.jsxDEV("p",{className:"text-center text-[10px] text-gray-600",children:["Saves as ",e.jsxDEV("code",{children:"indexplora-prompts.html"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:325,columnNumber:73},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:325,columnNumber:11},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:301,columnNumber:9},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:271,columnNumber:7},this),e.jsxDEV("div",{className:"max-w-3xl mx-auto px-6 pb-14",children:e.jsxDEV("div",{className:"rounded-2xl border border-white/5 bg-white/3 p-5",children:[e.jsxDEV("h3",{className:"text-xs font-bold text-white uppercase tracking-widest mb-3",children:"To export as PDF after downloading"},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:331,columnNumber:11},this),e.jsxDEV("ol",{className:"space-y-2",children:["Open the downloaded .html file in Chrome, Edge, or Safari.",'Click the "Save as PDF" button in the bottom-right of the page.','Set Destination to "Save as PDF" in the print dialog.','Enable "Background graphics" for full colour output.',"Click Save — your PDF is ready."].map((s,n)=>e.jsxDEV("li",{className:"flex items-start gap-3 text-xs text-gray-400 leading-relaxed",children:[e.jsxDEV("span",{className:"flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white mt-0.5",children:n+1},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:341,columnNumber:17},this),s]},n,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:340,columnNumber:15},this))},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:332,columnNumber:11},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:330,columnNumber:9},this)},void 0,!1,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:329,columnNumber:7},this)]},void 0,!0,{fileName:"/workspaces/default/.publishing/src/app/components/Downloads.tsx",lineNumber:255,columnNumber:5},this)}export{y as Downloads};
