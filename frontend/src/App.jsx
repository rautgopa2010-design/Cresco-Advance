import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import setAuthToken from "./utils/setAuthToken";
import api from "./utils/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout & Auth
import AppLayout from "@/routes/layout/AppLayout";
import ProtectedRoute from "@/routes/auth/ProtectedRoute";
import NotFoundPage from "./routes/auth/NotFoundPage";

// Pages
import DashboardWrapper from "./routes/dashboard/DashboardWrapper";
import Salutations from "./routes/master/Salutations";
import LeadStatus from "./routes/master/LeadStatus";
import LeadStage from "./routes/master/LeadStage";
import LeadSource from "./routes/master/LeadSource";
import ProductBrand from "./routes/master/ProductBrand";
import ProductCategory from "./routes/master/ProductCategory";
import ProductSubCategory from "./routes/master/ProductSubCategory";
import ProductUnit from "./routes/master/ProductUnit";
import Product from "./routes/master/Product";
import Role from "./routes/master/roles/Role";
import Employee from "./routes/master/employee/Employee";
import CreateEmployee from "./routes/master/employee/CreateEmployee";
import EditEmployee from "./routes/master/employee/EditEmployee";
import ViewEmployee from "./routes/master/employee/ViewEmployee";
import Rewards from "./routes/master/rewards/Rewards";
import Enquiry from "./routes/master/enquiry/Enquiry";
import CreateEnquiry from "./routes/master/enquiry/CreateEnquiry";
import EditEnquiry from "./routes/master/enquiry/EditEnquiry";
import ViewEnquiry from "./routes/master/enquiry/ViewEnquiry";
import Leads from "./routes/leads/Leads";
import CreateLeads from "./routes/leads/CreateLeads";
import EditLeads from "./routes/leads/EditLeads";
import ViewLeads from "./routes/leads/ViewLeads";
import Followup from "./routes/followup/Followup";
import Quotations from "./routes/quotations/Quotations";
import CreateQuotation from "./routes/quotations/CreateQuotation";
import EditQuotation from "./routes/quotations/EditQuotation";
import ViewQuotation from "./routes/quotations/ViewQuotation";
import Orders from "./routes/orders/Orders";
import GenerateOrder from "./routes/orders/GenerateOrder";
import EditOrder from "./routes/orders/EditOrder";
import ViewOrder from "./routes/orders/ViewOrder";
import OrderPayment from "./routes/orders/OrderPayment";
import OrderPaymentDetails from "./routes/orders/OrderPaymentDetails";
import PaymentLookup from "./routes/payments/PaymentLookup";
import VendorManager from "./routes/vendors/VendorManager";
import Customer from "./routes/customer/Customer";
import Invoice from "./routes/invoice/Invoice";
import GenerateInvoice from "./routes/invoice/GenerateInvoice";
import EditInvoice from "./routes/invoice/EditInvoice";
import ViewInvoice from "./routes/invoice/ViewInvoice";
import Reports from "./routes/reports/Reports";
import Analytics from "./routes/analytics/Analytics";
import Ticket from "./routes/tickets/Ticket";
import GenerateTicket from "./routes/tickets/GenerateTicket";
import UpdateTicket from "./routes/tickets/UpdateTicket";
import ViewTicket from "./routes/tickets/ViewTicket";
import TicketService from "./routes/master/TicketService";
import TicketPriority from "./routes/master/TicketPriority";
import IncentivePayment from "./routes/master/IncentivePayment";
import UpdateLandingPageSetup from "./routes/master/landingPageSetup/UpdateLandingPageSetup";
import ViewLandingPageSetup from "./routes/master/landingPageSetup/ViewLandingPageSetup";
import UpdateCompanySetup from "./routes/master/companySetup/UpdateCompanySetup";
import ViewCompanySetup from "./routes/master/companySetup/ViewCompanySetup";
import Country from "./routes/master/Country";
import CountryCode from "./routes/master/CountryCode";
import Currency from "./routes/master/Currency";
import Zones from "./routes/master/Zones";
import Profile from "./routes/profile/Profile";
import EditProfile from "./routes/profile/EditProfile";
import ApiData from "./routes/master/api/ApiData";
import LandingPage from "./routes/master/landingPage/LandingPage";
import ApiLeads from "./routes/master/api/ApiLeads";
import LandingPageLeads from "./routes/master/api/LandingPageLeads";
import AssignIncentive from "./routes/master/AssignIncentive";
import Incentive from "./routes/Incentive";

// Auth Pages
import Signin from "./routes/auth/Signin";
import Signup from "./routes/auth/Signup";
import ForgotPassword from "./routes/auth/ForgotPassword";
import VerifyToken from "./routes/auth/VerifyToken";
import ResetPassword from "./routes/auth/ResetPassword";

// Provider Pages
import EscalatedTickets from "./routes/providerRoutes/providerEscaletedTickets/EscalatedTickets";
import RegisteredCustomers from "./routes/providerRoutes/providerRegisteredCustomers/RegisteredCustomers";
import ProviderOrganization from "./routes/master/providerMaster/providerOrganizations/ProviderOrganization";
import ProviderCreateOrganization from "./routes/master/providerMaster/providerOrganizations/ProviderCreateOrganization";
import ProviderPackage from "./routes/master/providerMaster/providerPackages/ProviderPackage";
import ProviderEditPackage from "./routes/master/providerMaster/providerPackages/ProviderEditPackage";
import ProviderCreatePackage from "./routes/master/providerMaster/providerPackages/ProviderCreatePackage";
import ProviderPayment from "./routes/master/providerMaster/providerPayments/ProviderPayment";
import ProviderPaymentDetails from "./routes/master/providerMaster/providerPayments/ProviderPaymentDetails";
import ChoosePackage from "./routes/auth/ChoosePackage";
import PaymentPage from "./routes/auth/PaymentPage";
import CustomerList from "./routes/customer/CustomerList";
import PermissionRoute from "./routes/auth/PermissionRoute";
import CustomerCategory from "./routes/master/CustomerCategory";
import Industry from "./routes/master/Industry";

// Expiry Renew Page
import ExpiryRenew from "./routes/auth/ExpiryRenew";
import OrderStatus from "./routes/master/OrderStatus";

// Marketing Website Layout & Pages for provider
import MarketingLayout from "@/routes/layout/MarketingLayout";
import MarketingHome from "./routes/marketing/MarketingHome";
import History from "./routes/marketing/aboutUs/History";
import WhyUs from "./routes/marketing/aboutUs/WhyUs";
import Team from "./routes/marketing/aboutUs/Team";

// Landing Page Layout & Pages for each organizations
import LandingLayout from "./routes/layout/LandingLayout";
import LandingHome from "./routes/landing/LandingHome";
import PrivacyPolicy from "./routes/marketing/PrivacyPolicy";
import TermsOfService from "./routes/marketing/TermsOfService";
import Prefix from "./routes/master/Prefix";
import BankDetails from "./routes/master/bankdetailsAndQRCode/BankDetails";
import AddBankAccount from "./routes/master/bankdetailsAndQRCode/AddBankAccount";
import EditBankAccount from "./routes/master/bankdetailsAndQRCode/EditBankAccount";
import TawkToWidget from "./TawkToWidget";
import TAndCAndDec from "./routes/master/TAndCAndDec";

// Simple 404 Page
const NotFound = () => <NotFoundPage />;

function AppRoutes() {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const [sessionVersion, setSessionVersion] = useState(0);
    const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), [sessionVersion]);

    if (token) {
        setAuthToken(token);
    }

    useEffect(() => {
        if (!token) return undefined;

        let active = true;
        const refreshSession = async () => {
            try {
                const res = await api.get("/auth/refresh-session");
                const nextToken = res.data?.token;
                const nextUser = res.data?.user;

                if (!active || !nextUser) return;

                if (nextToken) {
                    localStorage.setItem("token", nextToken);
                    setAuthToken(nextToken);
                }

                const serializedUser = JSON.stringify(nextUser);
                if (localStorage.getItem("user") !== serializedUser) {
                    localStorage.setItem("user", serializedUser);
                    setSessionVersion((version) => version + 1);
                    window.dispatchEvent(new Event("sessionUserUpdated"));
                }
            } catch {
                // Existing API interceptor handles auth failures.
            }
        };

        refreshSession();
        const intervalId = window.setInterval(refreshSession, 30000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, [token, location.pathname]);

    const excludedRoutes = ["/signin", "/signup", "/forgot-password", "/verify-token", "/reset-password", "/choose-package", "/payment"];

    const today = new Date();
    const expiryDate = user?.packageExpiryDate ? new Date(user.packageExpiryDate) : null;

    // // ✅ Manual test date (YYYY-MM-DD)
    // const expiryDate = new Date("2025-01-01"); // set any past date to trigger modal

    const showExpiry = user?.user_type === "company" && expiryDate && expiryDate < today && !excludedRoutes.includes(location.pathname);

    const expiryUI = showExpiry ? <ExpiryRenew /> : null;

    const routes = useMemo(() => {
        return [
            // ==================== PUBLIC AUTH PAGES ====================
            { path: "/signin", element: <Signin /> },
            { path: "/signup", element: <Signup /> },
            { path: "/forgot-password", element: <ForgotPassword /> },
            { path: "/verify-token", element: <VerifyToken /> },
            { path: "/reset-password", element: <ResetPassword /> },
            { path: "/choose-package", element: <ChoosePackage /> },
            { path: "/payment", element: <PaymentPage /> },

            // ==================== MARKETING WEBSITE (Always public, clean layout) ====================
            {
                path: "/marketing-website",
                element: <MarketingLayout />,
                children: [
                    { index: true, element: <MarketingHome /> },
                    {
                        path: "privacy-policy",
                        element: <PrivacyPolicy />,
                    },
                    {
                        path: "terms-service",
                        element: <TermsOfService />,
                    },
                    { path: ":section", element: <MarketingHome /> },
                    { path: "about-us/history", element: <History /> },
                    { path: "about-us/why-us", element: <WhyUs /> },
                    { path: "about-us/team", element: <Team /> },
                    { path: "*", element: <NotFoundPage /> },
                ],
            },

            // ==================== ORGANIZATION LANDING PAGES (Public) ====================
            {
                path: "/landing/:companySlug",
                element: <LandingLayout />,
                children: [
                    { index: true, element: <LandingHome /> },
                    { path: ":section", element: <LandingHome /> },
                    { path: "*", element: <NotFoundPage /> },
                ],
            },

            // ==================== PROTECTED CRM APP ====================
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: "/",
                        element: <AppLayout />,
                        children: [
                            { index: true, element: <DashboardWrapper /> },
                            ...(user?.user_type === "provider"
                                ? [
                                      { path: "provider/escalated-tickets", element: <EscalatedTickets /> },
                                      { path: "provider/registered-customers", element: <RegisteredCustomers /> },
                                      { path: "reports", element: <Reports /> },
                                      { path: "provider/settings/master/organization", element: <ProviderOrganization /> },
                                      { path: "provider/settings/master/organization/create-organization", element: <ProviderCreateOrganization /> },
                                      { path: "settings/master/salutations", element: <Salutations /> },
                                      { path: "settings/master/country", element: <Country /> },
                                      { path: "settings/master/country-code", element: <CountryCode /> },
                                      { path: "settings/master/currency", element: <Currency /> },
                                      { path: "provider/settings/master/package", element: <ProviderPackage /> },
                                      { path: "provider/settings/master/package/edit-package/:id", element: <ProviderEditPackage /> },
                                      { path: "provider/settings/master/package/create-package", element: <ProviderCreatePackage /> },
                                      { path: "provider/settings/master/payment", element: <ProviderPayment /> },
                                      { path: "provider/settings/master/payment/details/:orgId", element: <ProviderPaymentDetails /> },
                                      { path: "settings/bank-setup", element: <BankDetails /> },
                                      { path: "settings/bank-setup/add-bank", element: <AddBankAccount /> },
                                      { path: "settings/bank-setup/edit-bank/:id", element: <EditBankAccount /> },
                                      { path: "settings/company-setup", element: <ViewCompanySetup /> },
                                      { path: "settings/company-setup/edit-company-setup/:id", element: <UpdateCompanySetup /> },
                                      { path: "profile/:id", element: <Profile /> },
                                      { path: "profile/edit-profile/:id", element: <EditProfile /> },
                                  ]
                                : [
                                      {
                                          path: "settings/master/salutations",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Salutations />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/lead-status",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<LeadStatus />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/lead-stage",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<LeadStage />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/lead-source",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<LeadSource />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/product-brand",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<ProductBrand />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/product-category",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<ProductCategory />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/product-sub-category",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<ProductSubCategory />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/product-product-unit",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<ProductUnit />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/product",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Product />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/country",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Country />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/country-code",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<CountryCode />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/currency",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Currency />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/zones",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Zones />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/employee",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Employee />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/employee/create-employee",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<CreateEmployee />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/employee/edit-employee/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<EditEmployee />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/employee/view-employee/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<ViewEmployee />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/rewards",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Rewards />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/api",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<ApiData />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "enquiry",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Enquiry"
                                                  element={<Enquiry />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "enquiry/create-enquiry",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Enquiry"
                                                  element={<CreateEnquiry />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "enquiry/edit-enquiry/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Enquiry"
                                                  element={<EditEnquiry />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "enquiry/view-enquiry/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Enquiry"
                                                  element={<ViewEnquiry />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "enquiries",
                                          element: <PermissionRoute moduleName="Enquiry" element={<Enquiry />} />,
                                      },
                                      {
                                          path: "enquiries/new",
                                          element: <PermissionRoute moduleName="Enquiry" element={<CreateEnquiry />} />,
                                      },
                                      {
                                          path: "enquiries/:id/edit",
                                          element: <PermissionRoute moduleName="Enquiry" element={<EditEnquiry />} />,
                                      },
                                      {
                                          path: "enquiries/:id",
                                          element: <PermissionRoute moduleName="Enquiry" element={<ViewEnquiry />} />,
                                      },
                                      ...(user?.role_name === "Super Admin"
                                          ? [
                                                { path: "settings/master/roles", element: <Role /> },
                                                { path: "settings/incentive-payment", element: <IncentivePayment /> },
                                                { path: "settings/landing-page-setup", element: <ViewLandingPageSetup /> },
                                                {
                                                    path: "settings/landing-page-setup/edit-landing-page-setup/:id",
                                                    element: <UpdateLandingPageSetup />,
                                                },
                                                { path: "settings/bank-setup", element: <BankDetails /> },
                                                { path: "settings/bank-setup/add-bank", element: <AddBankAccount /> },
                                                { path: "settings/bank-setup/edit-bank/:id", element: <EditBankAccount /> },
                                                { path: "settings/company-setup", element: <ViewCompanySetup /> },
                                                { path: "settings/company-setup/edit-company-setup/:id", element: <UpdateCompanySetup /> },
                                                { path: "settings/master/assign-incentive", element: <AssignIncentive /> },
                                                {
                                                    path: "landing-page",
                                                    element: (
                                                        <PermissionRoute
                                                            moduleName="Master"
                                                            element={<LandingPage />}
                                                        />
                                                    ),
                                                },
                                            ]
                                          : []),
                                      {
                                          path: "incentive",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Incentive"
                                                  element={<Incentive />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/customer-category",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<CustomerCategory />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/industry",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Industry />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/order-status",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<OrderStatus />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/prefix",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<Prefix />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/t-c-dec",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<TAndCAndDec />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "leads",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Leads"
                                                  element={<Leads />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "leads/create-leads",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Leads"
                                                  element={<CreateLeads />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "leads/edit-leads/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Leads"
                                                  element={<EditLeads />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "leads/view-leads/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Leads"
                                                  element={<ViewLeads />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "api-leads",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="API Leads"
                                                  element={<ApiLeads />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "api-leads/landing-page-leads",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="API Leads"
                                                  element={<LandingPageLeads />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "followup",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Followup"
                                                  element={<Followup />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "quotations",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Quotations"
                                                  element={<Quotations />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "quotations/create-quotation",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Quotations"
                                                  element={<CreateQuotation />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "quotations/edit-quotation/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Quotations"
                                                  element={<EditQuotation />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "quotations/view-quotation/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Quotations"
                                                  element={<ViewQuotation />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "orders",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Orders"
                                                  element={<Orders />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "orders/generate-order",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Orders"
                                                  element={<GenerateOrder />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "orders/edit-order/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Orders"
                                                  element={<EditOrder />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "orders/view-order/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Orders"
                                                  element={<ViewOrder />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "orders/:id/payments",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Orders"
                                                  element={<OrderPayment />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "orders/:orderId/payments/details/:paymentId",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Orders"
                                                  element={<OrderPaymentDetails />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "payments",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Orders"
                                                  element={<PaymentLookup />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "vendors",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<VendorManager mode="list" />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "vendors/add",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<VendorManager mode="add" />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "customer",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Customer"
                                                  element={<Customer />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "customer/:companyName",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Customer"
                                                  element={<CustomerList />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "invoice",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Invoice"
                                                  element={<Invoice />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "invoice/generate-invoice",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Invoice"
                                                  element={<GenerateInvoice />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "invoice/edit-invoice/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Invoice"
                                                  element={<EditInvoice />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "invoice/view-invoice/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Invoice"
                                                  element={<ViewInvoice />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "reports",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Reports"
                                                  element={<Reports />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "analytics",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Reports"
                                                  element={<Analytics />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "tickets",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Tickets"
                                                  element={<Ticket />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "tickets/generate-ticket",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Tickets"
                                                  element={<GenerateTicket />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "tickets/edit-ticket/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Tickets"
                                                  element={<UpdateTicket />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "tickets/view-ticket/:id",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Tickets"
                                                  element={<ViewTicket />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/ticket-service",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<TicketService />}
                                              />
                                          ),
                                      },
                                      {
                                          path: "settings/master/ticket-priority",
                                          element: (
                                              <PermissionRoute
                                                  moduleName="Master"
                                                  element={<TicketPriority />}
                                              />
                                          ),
                                      },
                                      { path: "profile/:id", element: <Profile /> },
                                      { path: "profile/edit-profile/:id", element: <EditProfile /> },
                                  ]),
                            { path: "*", element: <NotFound /> },
                        ],
                    },
                ],
            },

            // Optional: Catch-all for undefined routes (outside marketing)
            {
                path: "*",
                element: (
                    <Navigate
                        to="/marketing-website"
                        replace
                    />
                ),
            },
        ];
    }, [user]);

    return (
        <>
            {useRoutes(routes)}
            {showExpiry && (
                <div className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm" />
                    <div className="pointer-events-auto relative z-10 mx-4">{expiryUI}</div>
                </div>
            )}
        </>
    );
}

function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppRoutes />
                <TawkToWidget />
            </BrowserRouter>
            <ToastContainer autoClose={3000} />
        </Provider>
    );
}

export default App;
