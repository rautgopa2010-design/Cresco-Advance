export const packageModuleGroups = [
    {
        title: "CRM",
        description: "Sales, customers, orders, invoices, reports and CRM setup.",
        modules: [
            { id: "crm-enquiry", name: "Enquiry" },
            { id: "crm-leads", name: "Leads" },
            { id: "crm-api-leads", name: "API Leads" },
            { id: "crm-followup", name: "Followup" },
            { id: "crm-quotations", name: "Quotations" },
            { id: "crm-orders", name: "Orders" },
            { id: "crm-customer", name: "Customer" },
            { id: "crm-invoice", name: "Invoice" },
            { id: "crm-reports", name: "Reports" },
            { id: "crm-incentive", name: "Incentive" },
            { id: "crm-master", name: "Master" },
        ],
    },
    {
        title: "Advanced CRM Add-ons",
        description: "Optional premium sales, automation and engagement workspaces.",
        modules: [
            { id: "crm-sales-pipeline", name: "Sales Pipeline" },
            { id: "crm-sales-automation", name: "Sales Automation" },
            { id: "crm-engagement-hub", name: "Engagement Hub" },
            { id: "crm-ai-sales-assistant", name: "AI Sales Assistant" },
            { id: "crm-field-visits", name: "Field Visits" },
        ],
    },
    {
        title: "HRMS",
        description: "Employees, attendance, leaves, payroll and HR operations.",
        modules: [
            { id: "hr-dashboard", name: "HR Dashboard" },
            { id: "hr-employees", name: "Employees" },
            { id: "hr-departments", name: "Departments" },
            { id: "hr-designations", name: "Designations" },
            { id: "hr-attendance", name: "Attendance" },
            { id: "hr-leaves", name: "Leaves" },
            { id: "hr-holidays", name: "Holidays" },
            { id: "hr-payroll", name: "Payroll" },
            { id: "hr-salary-slips", name: "Salary Slips" },
            { id: "hr-recruitment", name: "Recruitment" },
            { id: "hr-documents", name: "Employee Documents" },
            { id: "hr-performance", name: "Performance" },
            { id: "hr-reports", name: "HR Reports" },
            { id: "hr-settings", name: "HR Settings" },
        ],
    },
    {
        title: "Support",
        description: "Helpdesk and customer support operations.",
        modules: [{ id: "support-tickets", name: "Tickets" }],
    },
];

export const availablePackageModules = packageModuleGroups.flatMap((group) => group.modules);

export const getModuleGroupTitle = (moduleName) =>
    packageModuleGroups.find((group) => group.modules.some((module) => module.name === moduleName))?.title || "Other";
