import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | eForwarder",
  description: "Terms of Service for eForwarder Wholesale marketplace",
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>

        <p className="mb-8 text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              By accessing or using the eForwarder website and services (collectively, the &quot;Service&quot;), 
              you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these 
              Terms, you may not access or use the Service. These Terms apply to all visitors, users, 
              and others who access or use the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              2. Description of Service
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              eForwarder is a business-to-business (B2B) wholesale marketplace that connects sneaker 
              suppliers with retail buyers. Our platform facilitates the listing, discovery, and 
              purchase of authentic wholesale sneaker inventory. We provide tools for pricing 
              comparison, order management, and communication between buyers and sellers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              3. Account Registration
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              To access certain features of the Service, you must register for an account. When 
              registering, you agree to provide accurate, current, and complete information. You 
              are responsible for maintaining the confidentiality of your account credentials and 
              for all activities that occur under your account. You must notify us immediately of 
              any unauthorized use of your account.
            </p>
            <p className="mb-4 text-slate-600 leading-relaxed">
              eForwarder reserves the right to suspend or terminate accounts that violate these 
              Terms or engage in fraudulent, abusive, or illegal activity.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              4. Business Accounts
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              eForwarder is intended for business use. By creating an account, you represent that 
              you are acting on behalf of a legitimate business entity and have the authority to 
              bind that entity to these Terms. We reserve the right to verify business credentials 
              and may restrict access to users who cannot demonstrate legitimate business purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              5. Product Listings and Authenticity
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              All products listed on eForwarder must be authentic. Sellers are solely responsible 
              for ensuring the authenticity and accuracy of their product listings, including 
              descriptions, images, pricing, and availability. The listing of counterfeit, replica, 
              or misrepresented products is strictly prohibited and will result in immediate account 
              termination and potential legal action.
            </p>
            <p className="mb-4 text-slate-600 leading-relaxed">
              While eForwarder strives to maintain a marketplace of authentic products, we do not 
              guarantee the authenticity of any product and are not responsible for verifying 
              individual listings. Buyers are encouraged to conduct their own due diligence.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              6. Orders and Payments
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              All orders placed through eForwarder are subject to acceptance by the seller. Prices 
              are displayed in US Dollars unless otherwise indicated. Volume pricing and discounts 
              may apply based on order quantities. Payment terms and methods are specified during 
              the checkout process.
            </p>
            <p className="mb-4 text-slate-600 leading-relaxed">
              By placing an order, you agree to pay all applicable fees, including product costs, 
              shipping, and any applicable taxes. eForwarder uses third-party payment processors 
              and is not responsible for errors or issues arising from payment processing.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              7. Shipping and Delivery
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Shipping terms, costs, and estimated delivery times are provided at checkout. 
              Delivery times are estimates only and are not guaranteed. eForwarder is not 
              responsible for delays caused by carriers, customs, or other factors outside our 
              control. Risk of loss and title for products pass to the buyer upon delivery to 
              the carrier.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              8. Returns and Refunds
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              Return and refund policies may vary by seller and product. Buyers should review 
              the applicable return policy before placing an order. In general, returns may be 
              accepted for defective or incorrectly shipped products. Refunds will be processed 
              using the original payment method within a reasonable timeframe.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              9. Intellectual Property
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              The Service and its original content, features, and functionality are owned by 
              eForwarder and are protected by international copyright, trademark, patent, trade 
              secret, and other intellectual property laws. You may not copy, modify, distribute, 
              sell, or lease any part of our Service without prior written consent.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              10. Prohibited Conduct
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              You agree not to:
            </p>
            <ul className="mb-4 list-disc pl-6 text-slate-600 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>List or sell counterfeit, stolen, or illegally obtained products</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Scrape or collect data from the Service without authorization</li>
              <li>Circumvent any security measures or access restrictions</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              11. Disclaimer of Warranties
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. EFORWARDER 
              DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              12. Limitation of Liability
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, EFORWARDER SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF 
              PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, 
              USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              13. Indemnification
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              You agree to indemnify and hold harmless eForwarder, its officers, directors, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses 
              (including attorneys&apos; fees) arising out of or related to your use of the Service, 
              your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              14. Modifications to Terms
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              eForwarder reserves the right to modify these Terms at any time. We will notify 
              users of material changes by posting the updated Terms on the Service and updating 
              the &quot;Last updated&quot; date. Your continued use of the Service after such modifications 
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              15. Governing Law
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the 
              United States, without regard to conflict of law principles. Any disputes arising 
              from these Terms or your use of the Service shall be resolved in the courts located 
              within the United States.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">
              16. Contact Information
            </h2>
            <p className="mb-4 text-slate-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-slate-600">
              <strong>eForwarder</strong><br />
              Email: support@eforwarder.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
