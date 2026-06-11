import authReducer from "./auth";
import companySetupReducer from "./companySetup";
import assignedIncentivesReducer from "./assignedIncentives";
import profileReducer from "./profile";
import rbacReducer from "./rbac";
import { combineReducers } from "redux";
import salutationReducer from "./salutation";
import leadStatusReducer from "./leadStatus";
import leadStageReducer from "./leadStage";
import leadSourceReducer from "./leadSource";
import productBrandReducer from "./productBrand";
import productCategoryReducer from "./productCategory";
import productSubCategoryReducer from "./productSubCategory";
import productUnitReducer from "./productUnit";
import productReducer from "./product";
import countryReducer from "./country";
import countryCodeReducer from "./countryCode";
import currencyReducer from "./currency";
import zonesReducer from "./zones";
import employeeReducer from "./employee";
import customerReducer from "./customer";
import leadAndFollowupReducer from "./leadAndFollowup";
import quotationReducer from "./quotation";
import orderReducer from "./order";
import orderPaymentReducer from "./orderPayment";
import incentiveReducer from "./incentive";
import invoiceReducer from "./invoice";
import ticketServiceReducer from "./ticketService";
import ticketPriorityReducer from "./ticketPriority";
import ticketReducer from "./ticket";
import packageReducer from "./package";
import apiMasterReducer from "./apiMaster";
import customerCategoryReducer from "./customerCategory";
import industryReducer from "./industry";
import orderStatusReducer from "./orderStatus";
import dashboardReducer from "./dashboard";
import providerDashboardReducer from "./providerDashboard";
import landingPageLeadReducer from "./landingPageLeadReducer";
import landingPageSetupReducer from "./landingPageSetup";
import prefixReducer from "./prefix";
import notificationReducer from "./notification";
import bankDetailsReducer from "./bankDetails";
import tAndCAndDecReducer from "./tAndCAndDecReducer";

const rootReducer = combineReducers({
    auth: authReducer,
    rbac: rbacReducer,
    companySetup: companySetupReducer,
    assignedIncentives: assignedIncentivesReducer,
    profile: profileReducer,
    salutation: salutationReducer,
    leadStatus: leadStatusReducer,
    leadStage: leadStageReducer,
    leadSource: leadSourceReducer,
    productBrand: productBrandReducer,
    productCategory: productCategoryReducer,
    productSubCategory: productSubCategoryReducer,
    productUnit: productUnitReducer,
    product: productReducer,
    country: countryReducer,
    countryCode: countryCodeReducer,
    currency: currencyReducer,
    zones: zonesReducer,
    employee: employeeReducer,
    customer: customerReducer,
    leadAndFollowup: leadAndFollowupReducer,
    quotation: quotationReducer,
    order: orderReducer,
    orderPayment: orderPaymentReducer,
    incentive: incentiveReducer,
    invoice: invoiceReducer,
    ticketService: ticketServiceReducer,
    ticketPriority: ticketPriorityReducer,
    ticket: ticketReducer,
    package: packageReducer,
    apiMaster: apiMasterReducer,
    customerCategory: customerCategoryReducer,
    industry: industryReducer,
    orderStatus: orderStatusReducer,
    dashboard: dashboardReducer,
    providerDashboard: providerDashboardReducer,
    landingPageLead: landingPageLeadReducer,
    landingPageSetup: landingPageSetupReducer,
    prefix: prefixReducer,
    notifications: notificationReducer,
    bankDetails: bankDetailsReducer,
    tAndCAndDec: tAndCAndDecReducer,
});

export default rootReducer;
