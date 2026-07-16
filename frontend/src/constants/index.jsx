import { Building2, CreditCard, Dot, Home, Settings, CircleDot, UserRound, User } from "lucide-react";
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

export const hrmsModuleNames = [
    "HRMS",
    "Employees",
    "Departments",
    "Designations",
    "Attendance",
    "Shift Management",
    "Attendance Regularization",
    "Leaves",
    "Leave Requests",
    "Leave Balance",
    "Holidays",
    "Holiday Calendar",
    "Payroll",
    "Salary Structure",
    "Salary Slips",
    "Payslips",
    "Recruitment",
    "Employee Documents",
    "Performance",
    "Goals",
    "Appraisal",
    "Performance Review",
    "HR Reports",
    "HR Settings",
    "Company",
    "Users",
    "Roles",
    "Permissions",
];

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
    { links: [{ label: "Enquiries", moduleName: "Enquiry", icon: UserRound, path: "/enquiries" }] },
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
                    { label: "Pipeline", path: "/leads/pipeline", icon: Dot },
                    { label: "Opportunities", path: "/leads/opportunities", icon: Dot },
                    { label: "Revenue Forecast", path: "/leads/revenue-forecast", icon: Dot },
                    { label: "Automation", path: "/leads/automation", icon: Dot },
                    { label: "AI Suggestions", path: "/leads/ai-suggestions", icon: Dot },
                    { label: "API Leads", path: "/api-leads", icon: Dot },
                ],
            },
        ],
    },
    { links: [{ label: "Followup", icon: RiUserFollowLine, path: "/followup" }] },
    { links: [{ label: "Quotations", icon: SiWikiquote, path: "/quotations" }] },
    { links: [{ label: "Orders", icon: FaJediOrder, path: "/orders" }] },
    { links: [{ label: "Payment", icon: CreditCard, path: "/payments" }] },
    {
        links: [
            {
                label: "Vendor",
                icon: Building2,
                isAccordion: true,
                showArrow: true,
                defaultOpen: false,
                children: [
                    { label: "Add Vendor", path: "/vendors/add", icon: Dot },
                    { label: "Vendor List", path: "/vendors", icon: Dot },
                ],
            },
        ],
    },
    { links: [{ label: "Customer", icon: BsBorderStyle, path: "/customer" }] },
    { links: [{ label: "Invoice", icon: LiaFileInvoiceSolid, path: "/invoice" }] },
    { links: [{ label: "Reports", icon: TbReportAnalytics, path: "/reports" }] },
    { links: [{ label: "Analytics", moduleName: "Reports", icon: TbReportAnalytics, path: "/analytics" }] },
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

export const hrmsNavbarLinks = [
    {
        title: "EMPLOYEES",
        links: [
            { label: "Dashboard", moduleName: "HRMS", icon: Home, path: "/hrms" },
            { label: "Employees", icon: User, path: "/hrms/employees" },
            { label: "Departments", icon: Building2, path: "/hrms/departments" },
            { label: "Designations", icon: CircleDot, path: "/hrms/designations" },
            { label: "Employee Documents", icon: Dot, path: "/hrms/employee-documents" },
        ],
    },
    {
        title: "ATTENDANCE",
        links: [
            { label: "Attendance", icon: CircleDot, path: "/hrms/attendance" },
            { label: "Shift Management", icon: CircleDot, path: "/hrms/shift-management" },
            { label: "Attendance Regularization", icon: CircleDot, path: "/hrms/attendance-regularization" },
        ],
    },
    {
        title: "LEAVE",
        links: [
            { label: "Leave Requests", icon: CircleDot, path: "/hrms/leave-requests" },
            { label: "Leave Balance", icon: CircleDot, path: "/hrms/leave-balance" },
            { label: "Holiday Calendar", icon: CircleDot, path: "/hrms/holiday-calendar" },
        ],
    },
    {
        title: "PAYROLL",
        links: [
            { label: "Salary Structure", icon: CreditCard, path: "/hrms/salary-structure" },
            { label: "Payroll", icon: CreditCard, path: "/hrms/payroll" },
            { label: "Payslips", icon: Dot, path: "/hrms/payslips" },
        ],
    },
    {
        title: "PERFORMANCE",
        links: [
            { label: "Goals", icon: MdOutlineLeaderboard, path: "/hrms/goals" },
            { label: "Appraisal", icon: MdOutlineLeaderboard, path: "/hrms/appraisal" },
            { label: "Performance Review", icon: MdOutlineLeaderboard, path: "/hrms/performance-review" },
            { label: "Recruitment", icon: UserRound, path: "/hrms/recruitment" },
        ],
    },
    {
        title: "SETTINGS",
        links: [
            { label: "Company", icon: Building2, path: "/hrms/company" },
            { label: "Users", icon: UserRound, path: "/hrms/users" },
            { label: "Roles", icon: CircleDot, path: "/hrms/roles" },
            { label: "Permissions", icon: Settings, path: "/hrms/permissions" },
        ],
    },
];

export const providerHrmsNavbarLinks = [
    {
        title: "CRESCO HRMS PLATFORM",
        links: [
            { label: "Dashboard", icon: Home, path: "/hrms/provider" },
            { label: "Organizations", icon: Building2, path: "/hrms/provider/organizations" },
            { label: "Plans & Subscriptions", icon: CreditCard, path: "/hrms/provider/plans-subscriptions" },
            { label: "HRMS Modules", icon: CircleDot, path: "/hrms/provider/modules" },
            { label: "Organization Admins", icon: UserRound, path: "/hrms/provider/organization-admins" },
            { label: "Role Templates", icon: UserRound, path: "/hrms/provider/role-templates" },
            { label: "Implementation", icon: MdOutlineLeaderboard, path: "/hrms/provider/implementation" },
            { label: "Support", icon: TbReportAnalytics, path: "/hrms/provider/support" },
            { label: "Reports", icon: TbReportAnalytics, path: "/hrms/provider/reports" },
            { label: "Settings", icon: Settings, path: "/hrms/provider/settings" },
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
