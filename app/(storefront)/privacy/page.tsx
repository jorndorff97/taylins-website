import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | eForwarder",
  description: "Privacy Policy for eForwarder Wholesale marketplace",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="mb-8 text-4xl font-bold tracking-tight text-slate-900">
          Privacy Policy
        </h1>

        <p className="mb-8 text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              1. Introduction
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              eForwarder (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This 
              Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our B2B wholesale marketplace platform and related services (collectively, 
              the &quot;Service&quot;). Please read this policy carefully to understand our practices regarding 
              your personal data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              2. Information We Collect
            </h2>
            
            <h3 className="mb-3 text-xl font-medium text-slate-800">
              2.1 Information You Provide
            </h3>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We collect information you provide directly to us, including:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, phone number, password, and business information when you register for an account</li>
              <li><strong>Business Details:</strong> Company name, business address, tax identification numbers, and business credentials</li>
              <li><strong>Transaction Data:</strong> Purchase history, order details, payment information, and shipping addresses</li>
              <li><strong>Communications:</strong> Messages sent through our platform, customer support inquiries, and feedback</li>
              <li><strong>Profile Information:</strong> Any additional information you choose to add to your account profile</li>
            </ul>

            <h3 className="mb-3 text-xl font-medium text-slate-800">
              2.2 Information Collected Automatically
            </h3>
            <p className="mb-4 text-slate-600 leading-relaxed">
              When you use our Service, we automatically collect certain information, including:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, and search queries</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address</li>
              <li><strong>Cookies and Tracking:</strong> Information collected through cookies, web beacons, and similar technologies</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              3. How We Use Your Information
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We use the information we collect for the following purposes:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Provide Services:</strong> Process orders, facilitate transactions, and manage your account</li>
              <li><strong>Communication:</strong> Send order confirmations, shipping updates, and respond to inquiries</li>
              <li><strong>Improve Our Platform:</strong> Analyze usage patterns to enhance user experience and develop new features</li>
              <li><strong>Security:</strong> Detect and prevent fraud, unauthorized access, and other malicious activities</li>
              <li><strong>Marketing:</strong> Send promotional communications (with your consent where required)</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws, regulations, and legal processes</li>
              <li><strong>Business Operations:</strong> Conduct analytics, research, and business planning</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              4. How We Share Your Information
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We may share your information in the following circumstances:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>With Other Users:</strong> Information necessary to facilitate transactions between buyers and sellers</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist with payment processing, shipping, analytics, and customer support</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Protection of Rights:</strong> To protect the rights, property, or safety of eForwarder, our users, or others</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We do not sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              5. Cookies and Tracking Technologies
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We use cookies and similar tracking technologies to collect and store information about 
              your interactions with our Service. These technologies help us:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Authenticate your identity and maintain session security</li>
              <li>Analyze traffic and usage patterns</li>
              <li>Deliver relevant content and advertisements</li>
            </ul>
            <p className="mb-4 text-slate-600 leading-relaxed">
              You can control cookies through your browser settings. However, disabling cookies may 
              affect the functionality of certain features of our Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              6. Data Security
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect 
              your personal information against unauthorized access, alteration, disclosure, or 
              destruction. These measures include:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls limiting employee access to personal data</li>
            </ul>
            <p className="mb-4 text-slate-600 leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% 
              secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              7. Data Retention
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services, 
              comply with legal obligations, resolve disputes, and enforce our agreements. When your 
              information is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              8. Your Rights and Choices
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
              <li><strong>Restriction:</strong> Request restriction of certain processing activities</li>
            </ul>
            <p className="mb-4 text-slate-600 leading-relaxed">
              To exercise these rights, please contact us using the information provided below. We 
              will respond to your request within the timeframe required by applicable law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              9. Third-Party Links
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Our Service may contain links to third-party websites or services. We are not 
              responsible for the privacy practices of these third parties. We encourage you to 
              review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              10. Children&apos;s Privacy
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Our Service is intended for business users and is not directed at individuals under 
              the age of 18. We do not knowingly collect personal information from children. If we 
              become aware that we have collected personal information from a child, we will take 
              steps to delete such information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              11. International Data Transfers
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Your information may be transferred to and processed in countries other than your 
              country of residence. These countries may have different data protection laws. By 
              using our Service, you consent to the transfer of your information to these countries. 
              We take appropriate safeguards to ensure your data remains protected in accordance 
              with this Privacy Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              12. California Privacy Rights
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              If you are a California resident, you may have additional rights under the California 
              Consumer Privacy Act (CCPA), including the right to know what personal information we 
              collect, the right to delete your information, and the right to opt-out of the sale 
              of personal information. We do not sell personal information as defined by the CCPA.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              13. Changes to This Policy
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new Privacy Policy on this page and updating the 
              &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              14. Contact Us
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please 
              contact us at:
            </p>
            <p className="text-slate-600">
              <strong>eForwarder</strong><br />
              Email: privacy@eforwarder.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
