import React, { useRef, useState } from "react";

const ServiceCard = ({ service }) => {
    const cardRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const bounds = cardRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        });
    };

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onMouseMove={handleMouseMove}
            className="relative m-2 max-w-lg rounded-xl p-[1.5px] sm:m-4"
        >
            {/* GRADIENT BORDER */}
            <div
                className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    visible ? "opacity-100" : "opacity-0"
                }`}
                style={{
                    background: `radial-gradient(
                        300px circle at ${position.x}px ${position.y}px,
                        #3b82f6,
                        #6366f1,
                        #9333ea,
                        transparent 60%
                    )`,
                }}
            />

            {/* CARD CONTENT */}
            <div className="relative z-10 flex items-center gap-6 rounded-[10px] bg-white p-8 dark:bg-gray-900">
                <div className="rounded-full bg-gray-100 dark:bg-gray-700">
                    <img
                        src={service.icon}
                        alt=""
                        className="m-2 max-w-24 rounded-full bg-white dark:bg-gray-900"
                    />
                </div>

                <div className="flex-1 text-left">
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-white/70">
                        {service.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
