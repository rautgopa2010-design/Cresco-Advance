import React from "react";
import ScrollAdjust from "./ScrollAdjust";
import assets from "../../../assets/assets";
import { Link } from "react-router-dom";

const History = () => {
  return (
    <>
      <ScrollAdjust />
      <div className="relative overflow-hidden px-4 text-gray-700 dark:text-white md:px-20 lg:px-28 pt-0 md:pt-10 lg:pt-10">

        <div className="relative z-10 flex flex-col items-center gap-7 mb-16">
          <h1 className="text-3xl md:text-5xl font-medium">Our History</h1>
          <p className="text-center text-sm md:text-lg max-w-3xl">
            From humble beginnings to a trusted technology partner - a journey built on quality, innovation, and client success.
          </p>
        </div>

        {/* Company Overview */}
        <section className="relative z-10 max-w-5xl mx-auto mb-20">
          <p className="text-lg leading-relaxed text-gray-600 dark:text-white/80 mb-8">
            Cresco Software Solutions is a technology-driven software company focused on delivering reliable and customized IT solutions. We specialize in software development, web and mobile application development, and digital solutions that help businesses improve efficiency and grow digitally.
          </p>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-white/80 mb-8">
            Our team consists of skilled developers, designers, and technology experts who work closely with clients to understand their requirements and deliver practical, scalable, and cost-effective solutions. We serve startups, small businesses, and enterprise clients across various industries.
          </p>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-white/80">
            At Cresco Software Solutions, we believe in quality, innovation, and continuous improvement. Our goal is to build long-term partnerships by providing dependable technology solutions that support our clients’ business objectives.
          </p>
        </section>

        {/* Vision & Mission */}
        <section className="relative z-10 grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-20">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-white/80">
              To become a trusted technology partner by delivering innovative and reliable software solutions that empower businesses to achieve sustainable growth in the digital world.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <ul className="space-y-3 text-gray-600 dark:text-white/80">
              <li>• To design and develop custom software solutions that meet real business needs</li>
              <li>• To deliver high-quality, scalable, and secure technology solutions</li>
            </ul>
          </div>
        </section>

        {/* Why Choose Us for CRM */}
        <section className="relative z-10 mt-20 pt-16 border-t border-gray-200 dark:border-gray-800 max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium mb-10 text-center">Why Choose Us for CRM Software</h2>
          <ul className="grid md:grid-cols-2 gap-6 text-lg text-gray-600 dark:text-white/80">
            <li className="flex items-start gap-3">
              <span className="text-primary text-2xl">✔</span>
              <span><strong>Custom-Built CRM Solutions</strong> — We don’t believe in one-size-fits-all. Fully customized to your processes, industry, and growth plans.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-2xl">✔</span>
              <span><strong>Business-Focused Approach</strong> — Designed to manage leads, customers, sales, and support efficiently — not just store data.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-2xl">✔</span>
              <span><strong>Scalable & Secure Architecture</strong> — Built to grow with you, with strong security and role-based access controls.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-2xl">✔</span>
              <span><strong>Easy Integration</strong> — Seamless with ERP, payment gateways, email, WhatsApp, and third-party APIs.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-2xl">✔</span>
              <span><strong>User-Friendly Interface</strong> — Simple, intuitive design for fast adoption and minimal training.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-2xl">✔</span>
              <span><strong>Reliable Support & Maintenance</strong> — Ongoing enhancements to keep your CRM performing at its best.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary text-2xl">✔</span>
              <span><strong>Cost-Effective Solutions</strong> — Enterprise-grade CRM at competitive pricing for all business sizes.</span>
            </li>
          </ul>
        </section>

        {/* CTA similar to WhyUs */}
        <section className="relative z-10 mt-20 pt-16 border-t border-gray-200 dark:border-gray-800 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-medium mb-6">
              Ready to write the next chapter with a trusted technology partner?
            </h2>
            <p className="text-lg text-gray-600 dark:text-white/75 mb-8">
              Let's build solutions that drive your business forward — no complexity, just results.
            </p>
            <Link to="/signup"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-primary px-10 py-4 text-white font-medium transition-all hover:scale-105 dark:from-primary dark:to-purple-600"
            >
              Get Started Today
              <img src={assets.arrow_icon} width={16} alt="Arrow" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default History;