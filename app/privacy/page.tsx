import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What dcyfr.codes collects, who processes it, and how to exercise your privacy rights.',
  openGraph: { url: 'https://dcyfr.codes/privacy' },
};

const LAST_UPDATED = 'October 15, 2026';

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy at dcyfr.codes</h1>
        <p className="text-sm text-muted-foreground">Last updated {LAST_UPDATED}</p>
      </header>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What this page covers</h2>
          <p>This notice describes what <span className="font-medium text-foreground">dcyfr.codes</span> collects, and who processes it on our behalf. It sits alongside the DCYFR Labs privacy policy, which governs the wider estate.</p>
          <p><a href="https://dcyfr.ai/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Read the full DCYFR Labs privacy policy ↗</a></p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li><span className="font-medium text-foreground">Request logs</span> — IP address, user agent, and requested path, recorded by our host for security and debugging.</li>
            <li><span className="font-medium text-foreground">Aggregate analytics</span> — page views and performance timings, with no cookies and no per-person identifier.</li>
            <li><span className="font-medium text-foreground">Error reports</span> — the stack trace and browser context when something breaks.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What we do not do</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>No advertising, retargeting, or data sales.</li>
            <li>No cross-site tracking and no behavioural profiles.</li>
            <li>No accounts, and no marketing email from this site.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Session recording (Sentry Replay)</h2>
          <p>We sample roughly <span className="font-medium text-foreground">1% of sessions</span>, and record the session around an error when one occurs, so we can reproduce faults we cannot otherwise see.</p>
          <p>Recordings are <span className="font-medium text-foreground">masked at capture</span>: text content and media are replaced before the recording leaves your browser, so what we receive is layout and interaction timing, not the words on your screen. Recordings are stored by Sentry and deleted on their retention schedule.</p>
          <p>To opt out entirely, block <code className="rounded bg-muted px-1 py-0.5 text-xs">sentry.io</code> in your browser or use an extension that blocks error-monitoring scripts. The site works without it.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Processors</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-foreground">Vercel</span> — Hosting, content delivery, and request logs (IP address, user agent, requested path). Retained about 30 days.{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Privacy policy ↗</a>
            </li>
            <li>
              <span className="font-medium text-foreground">Vercel Analytics &amp; Speed Insights</span> — Aggregated page-view counts and Core Web Vitals. Cookieless, with no cross-site or per-person tracking.{' '}
              <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Privacy policy ↗</a>
            </li>
            <li>
              <span className="font-medium text-foreground">Sentry</span> — Error and performance monitoring, including Session Replay on a sampled basis. See the section above for what replay records.{' '}
              <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Privacy policy ↗</a>
            </li>
            <li>
              <span className="font-medium text-foreground">GitHub</span> — Creates a Gist when you use “Copy to Gist”. Only the published snippet is sent; a Gist created this way is public on GitHub.{' '}
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">Privacy policy ↗</a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>If you are in the EEA, the UK, or a US state with a comprehensive privacy law, you can ask us for a copy of your data, ask us to correct or delete it, or object to processing.</p>
          <p>Write to <a href="https://dcyfr.ai/contact" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">DCYFR Labs ↗</a> and say which site you are asking about. We aim to reply within 30 days.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">US state privacy rights: California, Colorado and Maryland</h2>
          <p>Some US states give their residents specific rights over personal information. DCYFR Labs may not meet the thresholds that make these laws apply to it, but we honour the rights below for anyone who asks, wherever they live.</p>
          <h3 className="pt-2 font-semibold text-foreground">California (CCPA, as amended by the CPRA)</h3>
          <p>If you live in California, you can:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><span className="font-medium text-foreground">Know</span> what personal information we collect, use and disclose, and get a copy of it.</li>
            <li><span className="font-medium text-foreground">Delete</span> personal information we hold about you.</li>
            <li><span className="font-medium text-foreground">Correct</span> personal information that is inaccurate.</li>
            <li><span className="font-medium text-foreground">Opt out of sale or sharing.</span> We do not sell personal information or share it for cross-context behavioural advertising, so there is nothing to opt out of. If your browser sends a Global Privacy Control signal, we treat it as an opt-out request anyway.</li>
            <li><span className="font-medium text-foreground">Limit use of sensitive personal information.</span> We do not collect it.</li>
            <li><span className="font-medium text-foreground">Not be treated differently</span> for using any of these rights.</li>
          </ul>
          <p>In the last 12 months we collected identifiers (the IP address and browser details our host records), internet activity (pages viewed, performance timings, error reports and masked session recordings) and approximate location (country). We collect it from you and from your browser, for the purposes described on this page, and keep it for the periods given under Processors. If you use “Copy to Gist”, the snippet you publish goes to GitHub and is public there.</p>
          <p>You can use an authorised agent. We will ask the agent for proof that you authorised them, and we may ask you to confirm your identity with us directly.</p>
          <h3 className="pt-2 font-semibold text-foreground">Colorado (Colorado Privacy Act)</h3>
          <p>If you live in Colorado, you can:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><span className="font-medium text-foreground">Confirm</span> whether we process your personal data, and get access to it.</li>
            <li><span className="font-medium text-foreground">Correct</span> inaccuracies in it.</li>
            <li><span className="font-medium text-foreground">Delete</span> it.</li>
            <li><span className="font-medium text-foreground">Get a portable copy</span> of it, up to twice a year.</li>
            <li><span className="font-medium text-foreground">Opt out</span> of targeted advertising, the sale of personal data, and profiling that leads to legal or similarly significant decisions. We do none of these. If your browser sends a Global Privacy Control signal, we treat it as an opt-out, and you can authorise someone else to opt out for you.</li>
          </ul>
          <h3 className="pt-2 font-semibold text-foreground">Maryland (Maryland Online Data Privacy Act)</h3>
          <p>If you live in Maryland, you can:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><span className="font-medium text-foreground">Confirm</span> whether we process your personal data, and get access to it.</li>
            <li><span className="font-medium text-foreground">Correct</span> inaccuracies in it.</li>
            <li><span className="font-medium text-foreground">Delete</span> it.</li>
            <li><span className="font-medium text-foreground">Get a portable copy</span> of data you gave us.</li>
            <li><span className="font-medium text-foreground">Opt out</span> of targeted advertising, the sale of personal data, and profiling that leads to legal or similarly significant decisions. We do none of these.</li>
            <li><span className="font-medium text-foreground">Get a list</span> of the categories of third parties we have disclosed personal data to. The services we use are listed under Processors above.</li>
          </ul>
          <p>We limit the personal data we collect to what is reasonably necessary to provide what you ask for, and we do not sell sensitive data.</p>
          <h3 className="pt-2 font-semibold text-foreground">How to make a request</h3>
          <p>Write to <a href="https://dcyfr.ai/contact" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">DCYFR Labs ↗</a> and say which site and which right you are asking about. We will confirm we received it within 10 business days, and we aim to answer within 30 days. The law allows 45. If we need more time, we will tell you why within the first 45 days and take no more than 45 more.</p>
          <p><span className="font-medium text-foreground">Appeals.</span> If we decline your request, reply to our decision to appeal it. We will answer in writing within 60 days, or within 45 days if you live in Colorado. If we deny the appeal, we will tell you how to contact your state Attorney General: the Consumer Protection Division in Maryland, or the Colorado Attorney General.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Children</h2>
          <p>dcyfr.codes is not directed to children under 13, and we do not knowingly collect their information.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p>We update this notice when the services behind dcyfr.codes change. The date at the top is the last revision.</p>
        </section>
      </div>
    </div>
  );
}
