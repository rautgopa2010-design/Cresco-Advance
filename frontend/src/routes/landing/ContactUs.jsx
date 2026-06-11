import React from "react";
import assets from "../../assets/assets";

const ContactUs = () => {
    return (
        <section className="min-h-screen bg-gray-50 px-4 py-20 dark:bg-gray-900 md:px-8 lg:px-20 xl:px-28">
            <div className="mx-auto max-w-7xl">
                {/* Grid Layout: Form Left, Image Right (lg+) */}
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
                    {/* Image Section - Hidden on md and below, visible and fixed on lg+ */}
                    <div className="relative hidden h-full min-h-96 md:block">
                        <div className="sticky top-24">
                            <img
                                src={assets.contact_hero}
                                alt="Contact us"
                                className="w-full rounded-2xl object-cover shadow-2xl md:h-[350px] lg:h-[700px]"
                            />
                            {/* Optional overlay for premium feel */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent"></div>
                        </div>
                    </div>
                    {/* Form Section - Visible on all screens */}
                    <div className="flex flex-col items-start gap-8 md:-mt-10 lg:mt-0 lg:max-w-lg">
                        <div className="text-left">
                            <h1 className="mb-4 text-4xl font-bold text-black dark:text-white md:text-5xl">Reach out to us</h1>
                            <p className="text-base text-gray-700 dark:text-gray-300 md:text-lg">
                                From strategy to execution, we're here to empower your business with seamless CRM experiences.
                            </p>
                        </div>

                        <form className="w-full space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Your Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center rounded-xl border border-gray-300 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800">
                                        <img
                                            src={assets.person_icon}
                                            alt=""
                                            className="ml-4 h-5 w-5"
                                        />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter your name"
                                            className="w-full bg-transparent p-4 text-sm outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Email Id <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center rounded-xl border border-gray-300 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800">
                                        <img
                                            src={assets.email_icon}
                                            alt=""
                                            className="ml-4 h-5 w-5"
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter your email"
                                            className="w-full bg-transparent p-4 text-sm outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={7}
                                    name="message"
                                    placeholder="Type your message here..."
                                    className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-black to-gray-700 px-8 py-4 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:from-gray-700 dark:to-black"
                            >
                                Submit
                                <img
                                    src={assets.arrow_icon}
                                    alt=""
                                    className="h-5 w-5"
                                />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;
