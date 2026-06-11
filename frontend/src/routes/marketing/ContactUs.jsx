import React from "react";
import assets from "../../assets/assets";

const ContactUs = () => {
    return (
        <div className="px-4 md:px-20 lg:px-28 pt-16 lg:pt-20 md:pt-20">
            <div className="flex flex-col items-center gap-7 text-gray-700 dark:text-white">
                <div className="text-3xl md:text-5xl">Reach out to us</div>
                <div className="text-center text-sm md:text-lg">
                    From strategy to execution, we're here to empower your business with seamless CRM experiences.
                </div>
                <form className="grid w-full max-w-2xl gap-3 sm:grid-cols-2 sm:gap-5">
                    <div>
                        <p className="mb-2 text-sm font-medium">Your Name <span className="text-red-500">*</span></p>
                        <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
                            <img
                                src={assets.person_icon}
                                alt=""
                            />
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                className="w-full p-3 text-sm outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-medium">Email Id <span className="text-red-500">*</span></p>
                        <div className="flex rounded-lg border border-gray-300 pl-3 dark:border-gray-600">
                            <img
                                src={assets.email_icon}
                                alt=""
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="w-full p-3 text-sm outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="mb-2 text-sm font-medium">Massage <span className="text-red-500">*</span></p>
                        <textarea
                            rows={8}
                            name="message"
                            placeholder="Type your message here"
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none dark:border-gray-600"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex w-max cursor-pointer gap-2 rounded-full bg-primary px-10 py-3 text-sm text-white transition-all hover:scale-105"
                    >
                        Submit{" "}
                        <img
                            src={assets.arrow_icon}
                            alt=""
                            className="w-4"
                        />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactUs;
