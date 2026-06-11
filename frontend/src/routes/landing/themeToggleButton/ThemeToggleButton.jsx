import React from "react";
import assets from "../../../assets/assets";

const ThemeToggleButton = ({ theme, setTheme }) => {
  return (
        <>
            <button>
                {theme === "dark" ? (
                    <img
                        onClick={() => {
                            setTheme("light");
                        }}
                        src={assets.sun_icon}
                        className="size-8 rounded-full border border-gray-500 p-1.5"
                        alt=""
                    />
                ) : (
                    <img
                        onClick={() => {
                            setTheme("dark");
                        }}
                        src={assets.moon_icon}
                        className="size-8 rounded-full border border-gray-500 p-1.5"
                        alt=""
                    />
                )}
            </button>
        </>
  );
};

export default ThemeToggleButton;