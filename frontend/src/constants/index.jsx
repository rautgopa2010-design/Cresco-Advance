import { Dot, Home, Settings, CircleDot, UserRound, User } from "lucide-react";
import { MdOutlineLeaderboard, MdOutlineSettingsAccessibility, MdPages } from "react-icons/md";
import { RiUserFollowLine } from "react-icons/ri";
import { SiWikiquote } from "react-icons/si";
import { FaJediOrder } from "react-icons/fa6";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { TbReportAnalytics } from "react-icons/tb";
import { IoTicket } from "react-icons/io5";
import { GiRapidshareArrow } from "react-icons/gi";
import { GiTargetShot } from "react-icons/gi";
import { BsBorderStyle } from "react-icons/bs";
import { AiFillBank } from "react-icons/ai";

// Provider Admin mode Links
export const providerAdminNavbarLinks = [
    {
        links: [{ label: "Dashboard", icon: Home, path: "/" }],
    },
    { links: [{ label: "Registered Customers", icon: User, path: "/provider/registered-customers" }] },
    { links: [{ label: "Escalated Tickets", icon: GiRapidshareArrow, path: "/provider/escalated-tickets" }] },
    { links: [{ label: "Reports", icon: TbReportAnalytics, path: "/reports" }] },
    {
        links: [
            {
                label: "Settings",
                icon: Settings,
                isAccordion: true,
                showArrow: false,
                defaultOpen: true,
                children: [
                    {
                        label: "Provider Master",
                        icon: CircleDot,
                        isGroup: true,
                        showArrow: true,
                        defaultOpen: false,
                        children: [
                            { label: "Organization", path: "/provider/settings/master/organization", icon: Dot },
                            { label: "Salutations", path: "/settings/master/salutations", icon: Dot },
                            { label: "Country", path: "/settings/master/country", icon: Dot },
                            { label: "Country Code", path: "/settings/master/country-code", icon: Dot },
                            { label: "Currency", path: "/settings/master/currency", icon: Dot },
                            { label: "Packages", path: "/provider/settings/master/package", icon: Dot },
                            { label: "Payment", path: "/provider/settings/master/payment", icon: Dot },
                        ],
                    },
                    { label: "Bank Setup", icon: AiFillBank, path: "/settings/bank-setup" },
                    { label: "Company Setup", icon: MdOutlineSettingsAccessibility, path: "/settings/company-setup" },
                ],
            },
        ],
    },
];

// Admin mode Links
export const adminNavbarLinks = [
    {
        links: [{ label: "Dashboard", icon: Home, path: "/" }],
    },
    { links: [{ label: "Enquiry", icon: UserRound, path: "/enquiry" }] },
    {
        links: [
            {
                label: "Leads",
                icon: MdOutlineLeaderboard,
                isAccordion: true,
                showArrow: true,
                defaultOpen: false,
                children: [
                    { label: "Leads", path: "/leads", icon: Dot },
                    { label: "API Leads", path: "/api-leads", icon: Dot },
                ],
            },
        ],
    },
    { links: [{ label: "Followup", icon: RiUserFollowLine, path: "/followup" }] },
    { links: [{ label: "Quotations", icon: SiWikiquote, path: "/quotations" }] },
    { links: [{ label: "Orders", icon: FaJediOrder, path: "/orders" }] },
    { links: [{ label: "Customer", icon: BsBorderStyle, path: "/customer" }] },
    { links: [{ label: "Invoice", icon: LiaFileInvoiceSolid, path: "/invoice" }] },
    { links: [{ label: "Reports", icon: TbReportAnalytics, path: "/reports" }] },
    { links: [{ label: "Incentive", icon: GiTargetShot, path: "/incentive" }] },
    {
        links: [
            {
                label: "Settings",
                icon: Settings,
                isAccordion: true,
                showArrow: false,
                defaultOpen: true,
                children: [
                    {
                        label: "Master",
                        icon: CircleDot,
                        isGroup: true,
                        showArrow: true,
                        defaultOpen: false,
                        children: [
                            { label: "Salutations", path: "/settings/master/salutations", icon: Dot },
                            { label: "Lead Status", path: "/settings/master/lead-status", icon: Dot },
                            { label: "Lead Stage", path: "/settings/master/lead-stage", icon: Dot },
                            { label: "Lead Source", path: "/settings/master/lead-source", icon: Dot },
                            { label: "Product Brand", path: "/settings/master/product-brand", icon: Dot },
                            { label: "Category", path: "/settings/master/product-category", icon: Dot },
                            { label: "Sub Category", path: "/settings/master/product-sub-category", icon: Dot },
                            { label: "Product Unit", path: "/settings/master/product-product-unit", icon: Dot },
                            { label: "Product", path: "/settings/master/product", icon: Dot },
                            { label: "Country", path: "/settings/master/country", icon: Dot },
                            { label: "Country Code", path: "/settings/master/country-code", icon: Dot },
                            { label: "Currency", path: "/settings/master/currency", icon: Dot },
                            { label: "Zones", path: "/settings/master/zones", icon: Dot },
                            { label: "Roles", path: "/settings/master/roles", icon: Dot },
                            { label: "Employees", path: "/settings/master/employee", icon: Dot },
                            // { label: "Rewards", path: "/settings/master/rewards", icon: Dot },
                            { label: "Api", path: "/settings/master/api", icon: Dot },
                            { label: "Landing Page", path: "/landing-page", icon: Dot },
                            { label: "Assign Incentive", path: "/settings/master/assign-incentive", icon: Dot },
                            { label: "Cust. Category", path: "/settings/master/customer-category", icon: Dot },
                            { label: "Industry", path: "/settings/master/industry", icon: Dot },
                            { label: "Order Status", path: "/settings/master/order-status", icon: Dot },
                            { label: "Prefix", path: "/settings/master/prefix", icon: Dot },
                            { label: "T&C & Dec", path: "/settings/master/t-c-dec", icon: Dot },
                        ],
                    },
                    { label: "Incentive Payment", icon: GiTargetShot, path: "/settings/incentive-payment" },
                    { label: "Landing Setup", icon: MdPages, path: "/settings/landing-page-setup" },
                    { label: "Bank Setup", icon: AiFillBank, path: "/settings/bank-setup" },
                    { label: "Company Setup", icon: MdOutlineSettingsAccessibility, path: "/settings/company-setup" },
                ],
            },
        ],
    },
];

// HelpDesk mode Links
export const helpDeskNavbarLinks = [
    {
        links: [{ label: "Dashboard", icon: Home, path: "/" }],
    },
    {
        links: [{ label: "Tickets", icon: IoTicket, path: "/tickets" }],
    },
    {
        links: [
            {
                label: "Settings",
                icon: Settings,
                isAccordion: true,
                showArrow: false,
                defaultOpen: true,
                children: [
                    {
                        label: "Master",
                        icon: CircleDot,
                        isGroup: true,
                        showArrow: true,
                        defaultOpen: false,
                        children: [
                            { label: "Ticket Service", path: "/settings/master/ticket-service", icon: Dot },
                            { label: "Ticket Priority", path: "/settings/master/ticket-priority", icon: Dot },
                        ],
                    },
                ],
            },
        ],
    },
];
