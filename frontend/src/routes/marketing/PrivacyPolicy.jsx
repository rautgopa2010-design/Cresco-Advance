import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
        <div className="px-8 py-10 sm:px-14">

          {/* Header */}
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Crescosoft Software Solutions – CRM Platform
          </p>

          <div className="mt-10 space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">

            <p>
              <strong>Crescosoft Software Solutions</strong> (“Crescosoft”, “we”, “our”, “us”) respects your privacy and is committed to protecting the personal and business information you share with us while using our CRM platform.
            </p>

            <p>
              By using our services, you agree to the practices described in this Privacy Policy.
            </p>

            {/* Section */}
            <Section title="Information We Collect">
              <p className="mt-2">We may collect:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Account details such as name, email address, phone number, and company name</li>
                <li>Login and usage information</li>
                <li>Customer and business data uploaded by you into the CRM</li>
                <li>Technical data such as IP address, browser type, and device information</li>
              </ul>
            </Section>

            <Section title="How We Use Information">
            <p className="mt-2">Your information is used only to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Provide and maintain CRM services</li>
                <li>Improve platform performance and security</li>
                <li>Communicate service updates and support messages</li>
                <li>Comply with legal requirements</li>
              </ul>
              <p className="mt-4 font-semibold">
                We do not sell or rent your personal or business data.
              </p>
            </Section>

            <Section title="Data Storage and Security">
              <p>
                Crescosoft uses reasonable technical and organizational security measures to protect stored data against unauthorized access, loss, or misuse. However, no system can be guaranteed to be completely secure.
              </p>
            </Section>

            <Section title="Data Ownership">
              <p>
                All customer and business data uploaded into the CRM remains your property. Crescosoft only processes this data to operate and support the platform.
              </p>
            </Section>

            <Section title="Sharing of Information">
            <p className="mt-2">We may share information only:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With trusted infrastructure or service providers under confidentiality obligations</li>
                <li>When required by law or government authorities</li>
                <li>To protect Crescosoft’s legal rights or system security</li>
              </ul>
            </Section>

            <Section title="Cookies and Tracking">
              <p>
                We may use cookies or similar technologies to improve user experience, system performance, and analytics.
              </p>
            </Section>

            <Section title="User Rights">
              <p>
                You may request access, correction, or deletion of your personal data by contacting Crescosoft support.
              </p>
            </Section>

            <Section title="Policy Updates">
              <p>
                This Privacy Policy may be updated periodically. Continued use of the platform indicates acceptance of the revised policy.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                For privacy-related questions, contact Crescosoft at:<br />
                <strong>Email:</strong> support@crescosoft.com
              </p>
            </Section>

            {/* Divider */}
            <hr className="border-gray-300 dark:border-gray-700" />

            {/* Refund Policy */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Refund Policy
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Crescosoft Software Solutions – CRM Platform
          </p>

            <p>
              This Refund Policy explains how Crescosoft handles subscription payments and refunds.
            </p>

            <Section title="Subscription Payments">
              <p>
                All subscription fees are charged in advance based on the selected plan and billing cycle.
              </p>
            </Section>

            <Section title="Refund Eligibility">
            <p className="mt-2">Refunds may be considered only in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Duplicate or incorrect payment</li>
                <li>Technical failure preventing service access for extended duration</li>
                <li>Legal or regulatory requirement</li>
              </ul>
              <p className="mt-3 font-semibold">
                All refund requests must be submitted within 7 days of payment.
              </p>
            </Section>

            <Section title="Non-Refundable Cases">
            <p className="mt-2">Refunds will not be provided for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Change of mind after usage</li>
                <li>Partial usage of subscription period</li>
                <li>Failure to cancel auto-renewal on time</li>
                <li>Misunderstanding of features</li>
              </ul>
            </Section>

            <Section title="Refund Processing">
              <p>
                Approved refunds will be processed using the original payment method and may take 7–10 working days to reflect depending on bank or payment provider.
              </p>
            </Section>

            <Section title="Cancellation Policy">
              <p>
                You may cancel your subscription anytime. Cancellation stops future billing but does not automatically trigger a refund unless eligible under this policy.
              </p>
            </Section>

            <Section title="Changes to Refund Policy">
              <p>
                Crescosoft reserves the right to modify this Refund Policy at any time. Updated policies will apply to future transactions.
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
      {title}
    </h3>
    {children}
  </div>
);

export default PrivacyPolicy;
