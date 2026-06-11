import { Button } from "@material-tailwind/react";
import { IoTicket } from "react-icons/io5";
import React from "react";
import { useNavigate } from "react-router-dom";
import TicketTable from "./TicketTable";

const Ticket = () => {
    const navigate = useNavigate();
    const handleCreateClick = () => {
        navigate("/tickets/generate-ticket");
    };

    return (
        <>
            <div className="card">
                <div className="flex items-center justify-between text-nowrap">
                    <div className="text-xs font-semibold text-[#433C50] md:text-lg lg:text-lg">Ticket's List :</div>
                    <Button
                        onClick={handleCreateClick}
                        variant="gradient"
                        className="flex items-center gap-2 rounded-full bg-[#053054] px-1 py-2 text-xs capitalize md:px-3 md:text-base lg:px-3 lg:text-base"
                    >
                        <IoTicket size={20} />
                        Generate Ticket
                    </Button>
                </div>

                <TicketTable />
            </div>
        </>
    );
};

export default Ticket;
