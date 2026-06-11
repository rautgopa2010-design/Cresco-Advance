import React from "react";
import notfound from "../../assets/notfound.png";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <>
            <div className="h-screen text-gray-900">
                {/* Top-centered text */}
                <div className="absolute left-1/2 top-0 mt-10 -translate-x-1/2 transform text-center md:left-[65%] lg:left-[55%]">
                    <h1 className="mt-14 hidden whitespace-nowrap text-xl font-bold text-red-700 md:block md:text-3xl lg:block lg:text-3xl">
                        404 Page Not Found
                    </h1>
                </div>

                <div className="-mt-16 flex h-full items-center justify-center md:-mt-28 lg:-mt-20">
                    <div className="grid content-center gap-12 lg:max-w-5xl lg:grid-cols-2 lg:items-center">
                        <div className="justify-self-center text-center lg:text-left">
                            <p className="-md:mt-5 mt-12 pb-2 font-semibold dark:text-white lg:mt-0">Error 404</p>
                            <h1 className="mt-5 pb-4 text-5xl font-bold dark:text-white md:mt-0 lg:mt-0 lg:text-6xl">Hey Buddy</h1>
                            <p className="px-4 pb-8 font-semibold dark:text-white md:px-0">
                                We can't seem to find the page, <br />
                                you are looking for or you are not authorized to view it.
                            </p>
                            <Link to="/">
                                <div className="inline-flex cursor-pointer items-center justify-center rounded-full bg-gray-900 px-5 py-2.5 font-bold text-white duration-300 hover:scale-105 dark:bg-white dark:text-black md:px-8 md:py-4">
                                    Go to Dashboard
                                </div>
                            </Link>
                        </div>

                        <div className="relative justify-self-center">
                            <img
                                src={notfound}
                                className="w-64 animate-[bounceImage_2s_infinite] md:w-96 lg:w-[400px]"
                                alt="Not Found"
                            />
                            <div className="absolute left-[20%] top-full mt-[-2rem] h-14 w-36 transform animate-[shadowScale_2s_infinite] rounded-[50%] bg-gray-900/30 blur-md dark:bg-white/30 md:h-16 md:w-64"></div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                {`
          @keyframes bounceImage {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes shadowScale {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(0.8);
              opacity: 0.7;
            }
          }
        `}
            </style>
        </>
    );
};

export default NotFoundPage;
