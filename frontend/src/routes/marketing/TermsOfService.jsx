import React from "react";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-xl dark:bg-gray-800">
                <div className="px-8 py-10 sm:px-14">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Terms of Service</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Crescosoft Software Solutions – CRM Platform</p>

                    <div className="mt-10 space-y-10 leading-relaxed text-gray-700 dark:text-gray-300">
                        <p>
                            By accessing or using Crescosoft CRM, you agree to comply with the following Terms of Service. If you do not agree, please
                            discontinue use of the platform.
                        </p>

                        <Section title="About the Platform">
                            <p>
                                Crescosoft Software Solutions provides a cloud-based Customer Relationship Management (CRM) platform that enables
                                organizations to manage customer data, sales activities, communications, and business workflows through web and mobile
                                interfaces.
                            </p>
                            <p className="mt-2">The platform is intended strictly for lawful professional and business use.</p>
                        </Section>

                        <Section title="User Authority and Eligibility">
                            <p>
                                If you are using the platform on behalf of an organization, you confirm that you are authorized to accept these terms
                                for that organization. You must be legally eligible to enter into a binding agreement.
                            </p>
                        </Section>

                        <Section title="Account Responsibility">
                            <p>
                                You are responsible for safeguarding your login credentials and for all activity carried out under your account.
                                Crescosoft is not responsible for losses resulting from unauthorized access caused by your failure to maintain
                                security.
                            </p>
                            <p className="mt-2">
                                You agree to provide accurate and up-to-date information while creating and maintaining your account.
                            </p>
                        </Section>

                        <Section title="Trial Access and Feature Testing">
                            <p>
                                Crescosoft may offer limited trial access or experimental features. These are provided for evaluation purposes only
                                and may be changed, restricted, or withdrawn at any time without obligation.
                            </p>
                            <p className="mt-2">Data created during trial usage may be removed unless the account is upgraded to a paid plan.</p>
                        </Section>

                        <Section title="Subscription, Billing, and Taxes">
                            <p>
                                Paid plans are billed in advance and renew automatically unless cancelled before the renewal date. Subscription fees
                                are non-refundable except where required by applicable law or explicitly stated otherwise.
                            </p>
                            <p className="mt-2">All applicable taxes shall be charged as per government regulations.</p>
                        </Section>

                        <Section title="Acceptable Use Policy">
                            <p>You agree not to misuse the platform. This includes, but is not limited to:</p>
                            <ul className="mt-2 list-disc space-y-2 pl-6">
                                <li>Engaging in illegal, deceptive, or harmful activities</li>
                                <li>Attempting to copy, modify, or reverse engineer the software</li>
                                <li>Uploading malicious, misleading, or unlawful content</li>
                                <li>Interfering with platform security or performance</li>
                                <li>Using the platform to compete with Crescosoft</li>
                                <li>Violation may lead to immediate suspension or termination of access.</li>
                            </ul>
                        </Section>

                        <Section title="Data Rights and Usage">
                            <p>
                                All business and customer data uploaded by you remains your property. Crescosoft processes such data only for
                                providing, maintaining, and improving the platform.
                            </p>
                            <p className="mt-2">You grant Crescosoft limited permission to store and process data solely for operational purposes.</p>
                        </Section>
                        <Section title="Privacy and Confidentiality">
                            <p>
                                Crescosoft handles personal and business information in accordance with its Privacy Policy. Reasonable security
                                measures are used to protect stored data.
                            </p>
                        </Section>
                        <Section title="Third-Party Services">
                            <p>
                                Some features may depend on external service providers. Crescosoft does not control these services and is not
                                responsible for their availability, performance, or policies.
                            </p>
                        </Section>
                        <Section title="Platform Availability">
                            <p>
                                Crescosoft strives to maintain reliable service but does not guarantee uninterrupted access. Temporary downtime may
                                occur due to maintenance, upgrades, or technical reasons.
                            </p>
                        </Section>
                        <Section title="Intellectual Property">
                            <p>
                                All software, branding, interface designs, and platform content belong exclusively to Crescosoft Software Solutions.
                                No rights are transferred except for limited usage during an active subscription.
                            </p>
                        </Section>
                        <Section title="Warranty Disclaimer">
                            <p>
                                The platform is provided on an “as available” basis without warranties of any kind. Crescosoft does not guarantee
                                error-free operation or suitability for specific business needs.
                            </p>
                        </Section>
                        <Section title="Limitation of Liability">
                            <p>
                                Crescosoft shall not be liable for indirect, incidental, or business losses. Total liability, if any, shall be limited
                                to the amount paid by you in the previous twelve months or ₹50,000, whichever is lower.
                            </p>
                        </Section>
                        <Section title="User Indemnity">
                            <p>
                                You agree to protect and indemnify Crescosoft against claims arising from your misuse of the platform or violation of
                                these terms.
                            </p>
                        </Section>
                        <Section title="Account Termination">
                            <p>
                                Either party may end the service relationship at any time. After termination, access will be discontinued and stored
                                data may be deleted after a reasonable period.{" "}
                            </p>
                        </Section>
                        <Section title="Legal Jurisdiction">
                            <p>
                                These Terms are governed by Indian law. Any disputes shall be subject to the exclusive jurisdiction of courts located
                                in Chennai.
                            </p>
                        </Section>

                        <Section title="Updates to These Terms">
                            <p>
                                Crescosoft may revise these Terms when required. Updated terms will become effective once published on the website or
                                platform.
                            </p>
                        </Section>

                        <Section title="Communication">
                            <p>Official notices may be sent through registered email or displayed within the platform interface.</p>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div>
        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        {children}
    </div>
);

export default TermsOfService;
