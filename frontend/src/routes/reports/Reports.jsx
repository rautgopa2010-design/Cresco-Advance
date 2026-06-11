import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileDown, Printer, Users, BarChart3, RefreshCw } from "lucide-react";
import { getCompanySetup } from "../../redux/actions/companySetup";
import { getCustomers } from "../../redux/actions/customer";
import { getLeads } from "../../redux/actions/leadAndFollowup";
import { getQuotations } from "../../redux/actions/quotation";
import { getOrders } from "../../redux/actions/order";
import { getInvoices } from "../../redux/actions/invoice";
import { getIncentives } from "../../redux/actions/incentive";
import { getOrganizationInfo } from "../../redux/actions/auth";
import { CircularProgress } from "@mui/material";
import { Button } from "@material-tailwind/react";
import EnquiryDetails from "./enquiryReports/EnquiryDetails";
import EnquiryCharts from "./enquiryReports/EnquiryCharts";
import EnquiryDetailsExcel from "./enquiryReports/EnquiryDetailsExcel";
import EnquiryDetailsPrint from "./enquiryReports/EnquiryDetailsPrint";
import EnquiryChartsPrint from "./enquiryReports/EnquiryChartsPrint";
import LeadDetails from "./leadsReports/LeadDetails";
import LeadCharts from "./leadsReports/LeadCharts";
import LeadDetailsExcel from "./leadsReports/LeadDetailsExcel";
import LeadDetailsPrint from "./leadsReports/LeadDetailsPrint";
import LeadChartsPrint from "./leadsReports/LeadChartsPrint";
import FollowupDetails from "./followupReports/FollowupDetails";
import FollowupCharts from "./followupReports/FollowupCharts";
import FollowupDetailsExcel from "./followupReports/FollowupDetailsExcel";
import FollowupDetailsPrint from "./followupReports/FollowupDetailsPrint";
import FollowupChartsPrint from "./followupReports/FollowupChartsPrint";
import QuotationDetails from "./quotationsReports/QuotationDetails";
import QuotationCharts from "./quotationsReports/QuotationCharts";
import QuotationDetailsExcel from "./quotationsReports/QuotationDetailsExcel";
import QuotationDetailsPrint from "./quotationsReports/QuotationDetailsPrint";
import QuotationChartsPrint from "./quotationsReports/QuotationChartsPrint";
import OrderDetails from "./orderReports/OrderDetails";
import OrderCharts from "./orderReports/OrderCharts";
import OrderDetailsExcel from "./orderReports/OrderDetailsExcel";
import OrderDetailsPrint from "./orderReports/OrderDetailsPrint";
import OrderChartsPrint from "./orderReports/OrderChartsPrint";
import InvoiceDetails from "./invoiceReports/InvoiceDetails";
import InvoiceCharts from "./invoiceReports/InvoiceCharts";
import InvoiceDetailsExcel from "./invoiceReports/InvoiceDetailsExcel";
import InvoiceDetailsPrint from "./invoiceReports/InvoiceDetailsPrint";
import InvoiceChartsPrint from "./invoiceReports/InvoiceChartsPrint";
import IncentiveDetails from "./incentiveReports/IncentiveDetails";
import IncentiveCharts from "./incentiveReports/IncentiveCharts";
import IncentiveDetailsExcel from "./incentiveReports/IncentiveDetailsExcel";
import IncentiveDetailsPrint from "./incentiveReports/IncentiveDetailsPrint";
import IncentiveChartsPrint from "./incentiveReports/IncentiveChartsPrint";
import RegisteredCustomersDetails from "./registeredCustomers/RegisteredCustomersDetails";
import RegisteredCustomersCharts from "./registeredCustomers/RegisteredCustomersCharts";
import RegisteredCustomersDetailsExcel from "./registeredCustomers/RegisteredCustomersDetailsExcel";
import RegisteredCustomersDetailsPrint from "./registeredCustomers/RegisteredCustomersDetailsPrint";
import RegisteredCustomersChartsPrint from "./registeredCustomers/RegisteredCustomersChartsPrint";
import PaymentsDetails from "./payments/PaymentsDetails";
import PaymentsCharts from "./payments/PaymentsCharts";
import PaymentsDetailsExcel from "./payments/PaymentsDetailsExcel";
import PaymentsDetailsPrint from "./payments/PaymentsDetailsPrint";
import PaymentsChartsPrint from "./payments/PaymentsChartsPrint";
import { SiWikiquote } from "react-icons/si";
import { FaJediOrder } from "react-icons/fa6";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { GiTargetShot } from "react-icons/gi";
import { IoCall } from "react-icons/io5";
import { RiUserFollowLine } from "react-icons/ri";

const Reports = () => {
    const dispatch = useDispatch();
    const { customers, customerloading } = useSelector((state) => state.customer);
    const { leads, followups, followupLoading, leadLoading } = useSelector((state) => state.leadAndFollowup);
    const { quotations, quotationsLoading } = useSelector((state) => state.quotation);
    const { orders, orderLoading } = useSelector((state) => state.order);
    const { invoices, invoiceLoading } = useSelector((state) => state.invoice);
    const { incentives, incentiveLoading } = useSelector((state) => state.incentive);
    const { companySetup } = useSelector((state) => state.companySetup);
    const { organizationInfo, organizationInfoLoading } = useSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState("");
    const [subTab, setSubTab] = useState("details");

    const customerRef = useRef();
    const enquiryExcelRef = useRef();
    const enquiryDetailsPrintRef = useRef();
    const enquiryChartsPrintRef = useRef();

    const leadRef = useRef();
    const leadExcelRef = useRef();
    const leadDetailsPrintRef = useRef();
    const leadChartsPrintRef = useRef();

    const followupRef = useRef();
    const followupExcelRef = useRef();
    const followupDetailsPrintRef = useRef();
    const followupChartsPrintRef = useRef();

    const quotationRef = useRef();
    const quotationExcelRef = useRef();
    const quotationDetailsPrintRef = useRef();
    const quotationChartsPrintRef = useRef();

    const orderRef = useRef();
    const orderExcelRef = useRef();
    const orderDetailsPrintRef = useRef();
    const orderChartsPrintRef = useRef();

    const invoiceRef = useRef();
    const invoiceExcelRef = useRef();
    const invoiceDetailsPrintRef = useRef();
    const invoiceChartsPrintRef = useRef();

    const incentiveRef = useRef();
    const incentiveExcelRef = useRef();
    const incentiveDetailsPrintRef = useRef();
    const incentiveChartsPrintRef = useRef();

    const registeredCustomersRef = useRef();
    const registeredCustomersExcelRef = useRef();
    const registeredCustomersDetailsPrintRef = useRef();
    const registeredCustomersChartsPrintRef = useRef();

    const paymentsRef = useRef();
    const paymentsExcelRef = useRef();
    const paymentsDetailsPrintRef = useRef();
    const paymentsChartsPrintRef = useRef();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (user?.user_type === "company") {
            dispatch(getCustomers());
            dispatch(getLeads());
            dispatch(getQuotations());
            dispatch(getOrders());
            dispatch(getInvoices());
            dispatch(getIncentives());
        } else {
            if (user?.user_type === "provider") {
                dispatch(getOrganizationInfo());
            }
        }
    }, [dispatch, user?.user_type]);

    console.log(organizationInfo);

    useEffect(() => {
        if (user.org_id) {
            dispatch(getCompanySetup(user.org_id));
        }
    }, [dispatch, user.org_id]);

    const isLoading =
        customerloading ||
        leadLoading ||
        followupLoading ||
        quotationsLoading ||
        orderLoading ||
        invoiceLoading ||
        incentiveLoading ||
        organizationInfoLoading;

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    const companyTabs = [
        { key: "enquiry", label: "Enquiry", icon: <Users size={18} /> },
        { key: "leads", label: "Leads", icon: <BarChart3 size={18} /> },
        { key: "followup", label: "Followup", icon: <RiUserFollowLine size={18} /> },
        { key: "quotations", label: "Quotations", icon: <SiWikiquote size={18} /> },
        { key: "orders", label: "Orders", icon: <FaJediOrder size={18} /> },
        { key: "invoice", label: "Invoice", icon: <LiaFileInvoiceSolid size={18} /> },
        { key: "incentive", label: "Incentive", icon: <GiTargetShot size={18} /> },
        { key: "dcr", label: "DCR", icon: <IoCall size={18} /> },
    ];

    const permissions = user?.permissions ? Object.keys(user.permissions) : [];

    // Filter company tabs
    const filteredCompanyTabs = companyTabs.filter((tab) => {
        if (tab.label.toLowerCase() === "dcr") return true; // ✅ Always show DCR
        return permissions.some((p) => p.toLowerCase() === tab.label.toLowerCase());
    });

    // Main tabs
    const tabs =
        user?.user_type === "provider"
            ? [
                  { key: "registered_customers", label: "Registered Customers", icon: <Users size={18} /> },
                  { key: "payments", label: "Payments", icon: <BarChart3 size={18} /> },
              ]
            : filteredCompanyTabs;

    // Sub-tabs mapping for all main tabs
    const subTabsMap = {
        enquiry: ["details", "charts"],
        leads: ["details", "charts"],
        followup: ["details", "charts"],
        quotations: ["details", "charts"],
        orders: ["details", "charts"],
        invoice: ["details", "charts"],
        incentive: ["details", "charts"],
        dcr: ["details", "charts"],
        registered_customers: ["details", "charts"],
        payments: ["details", "charts"],
    };

    // Labels for each sub-tab
    const subTabLabels = {
        // provider
        registered_customers: { details: "Registered Customers Details", charts: "Registered Customers Charts" },
        payments: { details: "Payments Details", charts: "Payments Charts" },
        // company
        enquiry: { details: "Enquiry Details", charts: "Enquiry Charts" },
        leads: { details: "Leads Details", charts: "Leads Charts" },
        followup: { details: "Followup Details", charts: "Followup Charts" },
        quotations: { details: "Quotations Details", charts: "Quotations Charts" },
        orders: { details: "Orders Details", charts: "Orders Charts" },
        invoice: { details: "Invoice Details", charts: "Invoice Charts" },
        incentive: { details: "Incentive Details", charts: "Incentive Charts" },
        dcr: { details: "DCR Details", charts: "DCR Charts" },
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="-mt-7 mb-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-wide text-[#053054] sm:text-3xl lg:text-4xl">📊 Reports</h1>

                {activeTab && (
                    <Button
                        onClick={() => {
                            setActiveTab("");
                            setSubTab("details");
                        }}
                        className="flex items-center gap-2 rounded-full bg-[#053054]/5 p-2 text-gray-600 transition duration-300 hover:bg-[#053054]/10 hover:text-[#053054]"
                        title="Reset Tabs"
                    >
                        <RefreshCw size={22} />
                    </Button>
                )}
            </div>

            {/* Main Tabs */}
            <div className="mb-6 flex flex-wrap gap-3 border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setSubTab(subTabsMap[tab.key][0]);
                        }}
                        className={`flex items-center gap-2 rounded-t-xl px-5 py-2.5 text-sm font-medium transition-all ${
                            activeTab === tab.key
                                ? "bg-[#053054] text-white shadow-md"
                                : "bg-[#053054]/10 text-gray-600 duration-300 hover:text-[#053054]"
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* If no main tab selected */}
            {!activeTab && (
                <div className="flex h-64 items-center justify-center text-nowrap text-base text-gray-600 md:text-lg">
                    Please <i>&nbsp;"Choose a Tab"&nbsp;</i> to get Report.
                </div>
            )}

            {/* Inner Content */}
            {activeTab && (
                <>
                    {/* Sub Tabs */}
                    <div className="mb-6 flex border-b">
                        {subTabsMap[activeTab]?.map((tabKey) => (
                            <button
                                key={tabKey}
                                onClick={() => setSubTab(tabKey)}
                                className={`mr-6 pb-2 text-sm font-medium transition ${
                                    subTab === tabKey ? "border-b-2 border-[#053054] text-[#053054]" : "text-gray-500 hover:text-[#053054]"
                                }`}
                            >
                                {subTabLabels[activeTab][tabKey]}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons For Details */}
                    {subTab === "details" && (
                        <div className="mb-4 flex flex-wrap justify-end gap-3">
                            <button
                                onClick={() => {
                                    if (activeTab === "enquiry") {
                                        const data = customerRef.current.getFilteredData();
                                        enquiryExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "leads") {
                                        const data = leadRef.current.getFilteredData();
                                        leadExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "followup") {
                                        const data = followupRef.current.getFilteredData();
                                        followupExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "quotations") {
                                        const data = quotationRef.current.getFilteredData();
                                        quotationExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "orders") {
                                        const data = orderRef.current.getFilteredData();
                                        orderExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "invoice") {
                                        const data = invoiceRef.current.getFilteredData();
                                        invoiceExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "incentive") {
                                        const data = incentiveRef.current.getFilteredData();
                                        incentiveExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "registered_customers") {
                                        const data = registeredCustomersRef.current.getFilteredData();
                                        registeredCustomersExcelRef.current.exportExcel(data);
                                    } else if (activeTab === "payments") {
                                        const data = paymentsRef.current.getFilteredData();
                                        paymentsExcelRef.current.exportExcel(data);
                                    }
                                }}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-white shadow-md transition hover:scale-105 sm:px-5"
                            >
                                <FileDown size={18} /> Export Excel
                            </button>

                            <button
                                onClick={() => {
                                    if (activeTab === "enquiry") {
                                        enquiryDetailsPrintRef.current.print();
                                    } else if (activeTab === "leads") {
                                        leadDetailsPrintRef.current.print();
                                    } else if (activeTab === "followup") {
                                        followupDetailsPrintRef.current.print();
                                    } else if (activeTab === "quotations") {
                                        quotationDetailsPrintRef.current.print();
                                    } else if (activeTab === "orders") {
                                        orderDetailsPrintRef.current.print();
                                    } else if (activeTab === "invoice") {
                                        invoiceDetailsPrintRef.current.print();
                                    } else if (activeTab === "incentive") {
                                        incentiveDetailsPrintRef.current.print();
                                    } else if (activeTab === "registered_customers") {
                                        registeredCustomersDetailsPrintRef.current.print();
                                    } else if (activeTab === "payments") {
                                        paymentsDetailsPrintRef.current.print();
                                    }
                                }}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white shadow-md transition hover:scale-105 sm:px-5"
                            >
                                <Printer size={18} /> Print
                            </button>
                        </div>
                    )}

                    {/* Print Button ONLY for Charts Tab */}
                    {subTab === "charts" && (
                        <div className="mb-4 flex flex-wrap justify-end gap-3">
                            <button
                                onClick={() => {
                                    if (activeTab === "enquiry") {
                                        enquiryChartsPrintRef.current.print();
                                    } else if (activeTab === "leads") {
                                        leadChartsPrintRef.current.print();
                                    } else if (activeTab === "followup") {
                                        followupChartsPrintRef.current.print();
                                    } else if (activeTab === "quotations") {
                                        quotationChartsPrintRef.current.print();
                                    } else if (activeTab === "orders") {
                                        orderChartsPrintRef.current.print();
                                    } else if (activeTab === "invoice") {
                                        invoiceChartsPrintRef.current.print();
                                    } else if (activeTab === "incentive") {
                                        incentiveChartsPrintRef.current.print();
                                    } else if (activeTab === "registered_customers") {
                                        registeredCustomersChartsPrintRef.current.print();
                                    } else if (activeTab === "payments") {
                                        paymentsChartsPrintRef.current.print();
                                    }
                                }}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white shadow-md transition hover:scale-105 sm:px-5"
                            >
                                <Printer size={18} /> Print
                            </button>
                        </div>
                    )}

                    {/* Content Box */}
                    <div className="overflow-x-auto rounded-xl border bg-white shadow-lg transition hover:shadow-xl">
                        {/* ENQUIRY */}
                        <div>
                            {activeTab === "enquiry" && subTab === "details" && (
                                <EnquiryDetails
                                    ref={customerRef}
                                    customers={customers}
                                />
                            )}
                            <EnquiryDetailsExcel
                                ref={enquiryExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <EnquiryDetailsPrint
                                ref={enquiryDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <EnquiryChartsPrint
                                ref={enquiryChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "enquiry" && subTab === "charts" && <EnquiryCharts customers={customers} />}
                        </div>

                        {/* LEADS */}
                        <div>
                            {activeTab === "leads" && subTab === "details" && (
                                <LeadDetails
                                    ref={leadRef}
                                    leads={leads}
                                />
                            )}
                            <LeadDetailsExcel
                                ref={leadExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <LeadDetailsPrint
                                ref={leadDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <LeadChartsPrint
                                ref={leadChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "leads" && subTab === "charts" && <LeadCharts leads={leads} />}
                        </div>

                        {/* FOLLOWUP */}
                        <div>
                            {activeTab === "followup" && subTab === "details" && (
                                <FollowupDetails
                                    ref={followupRef}
                                    followups={followups}
                                    leads={leads}
                                />
                            )}
                            <FollowupDetailsExcel
                                ref={followupExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <FollowupDetailsPrint
                                ref={followupDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <FollowupChartsPrint
                                ref={followupChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "followup" && subTab === "charts" && (
                                <FollowupCharts
                                    followups={followups}
                                    leads={leads}
                                />
                            )}
                        </div>

                        {/* QUOTATIONS */}
                        <div>
                            {activeTab === "quotations" && subTab === "details" && (
                                <QuotationDetails
                                    ref={quotationRef}
                                    quotations={quotations}
                                />
                            )}
                            <QuotationDetailsExcel
                                ref={quotationExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <QuotationDetailsPrint
                                ref={quotationDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <QuotationChartsPrint
                                ref={quotationChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "quotations" && subTab === "charts" && <QuotationCharts quotations={quotations} />}
                        </div>

                        {/* ORDERS */}
                        <div>
                            {activeTab === "orders" && subTab === "details" && (
                                <OrderDetails
                                    ref={orderRef}
                                    orders={orders}
                                />
                            )}
                            <OrderDetailsExcel
                                ref={orderExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <OrderDetailsPrint
                                ref={orderDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <OrderChartsPrint
                                ref={orderChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "orders" && subTab === "charts" && <OrderCharts orders={orders} />}
                        </div>

                        {/* INVOICES */}
                        <div>
                            {activeTab === "invoice" && subTab === "details" && (
                                <InvoiceDetails
                                    ref={invoiceRef}
                                    invoices={invoices}
                                />
                            )}
                            <InvoiceDetailsExcel
                                ref={invoiceExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <InvoiceDetailsPrint
                                ref={invoiceDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <InvoiceChartsPrint
                                ref={invoiceChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "invoice" && subTab === "charts" && <InvoiceCharts invoices={invoices} />}
                        </div>

                        {/* INCENTIVE */}
                        <div>
                            {activeTab === "incentive" && subTab === "details" && (
                                <IncentiveDetails
                                    ref={incentiveRef}
                                    incentives={incentives}
                                />
                            )}
                            <IncentiveDetailsExcel
                                ref={incentiveExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <IncentiveDetailsPrint
                                ref={incentiveDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <IncentiveChartsPrint
                                ref={incentiveChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "incentive" && subTab === "charts" && <IncentiveCharts incentives={incentives} />}
                        </div>

                        {/* REGISTERED CUSTOMERS */}
                        <div>
                            {activeTab === "registered_customers" && subTab === "details" && (
                                <RegisteredCustomersDetails
                                    ref={registeredCustomersRef}
                                    organizationInfo={organizationInfo}
                                />
                            )}
                            <RegisteredCustomersDetailsExcel
                                ref={registeredCustomersExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <RegisteredCustomersDetailsPrint
                                ref={registeredCustomersDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <RegisteredCustomersChartsPrint
                                ref={registeredCustomersChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "registered_customers" && subTab === "charts" && (
                                <RegisteredCustomersCharts organizationInfo={organizationInfo} />
                            )}
                        </div>

                        {/* PAYMENTS */}
                        <div>
                            {activeTab === "payments" && subTab === "details" && (
                                <PaymentsDetails
                                    ref={paymentsRef}
                                    organizationInfo={organizationInfo}
                                />
                            )}
                            <PaymentsDetailsExcel
                                ref={paymentsExcelRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <PaymentsDetailsPrint
                                ref={paymentsDetailsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            <PaymentsChartsPrint
                                ref={paymentsChartsPrintRef}
                                companyName={companySetup?.companyName || ""}
                                companyLogo={companySetup?.companyLogo || ""}
                            />
                            {activeTab === "payments" && subTab === "charts" && <PaymentsCharts organizationInfo={organizationInfo} />}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
