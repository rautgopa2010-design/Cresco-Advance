require("dotenv").config();
require("./cron/checkSubscriptionExpiry");
require("./cron/followupReminders");
require("./cron/salesAutomation");
const cors = require("cors");
const express = require("express");
const app = express();
const path = require("path");

// Sequelize initialization
const db = require("./models");
db.sequelize
  .sync()
  .then(() => console.log("✅ Tables synced with DB"))
  .catch((err) => console.error("❌ Sync error:", err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);
const companySetupRoutes = require("./routes/companySetup.routes");
app.use("/api/company-setup", companySetupRoutes);
const assignedIncentivesRoutes = require("./routes/assignedIncentives.routes");
app.use("/api/assigned-incentives", assignedIncentivesRoutes);
const profileRoutes = require("./routes/profile.routes");
app.use("/api/profile", profileRoutes);
const dashboardRoutes = require("./routes/dashboard.routes");
app.use("/api/dashboard", dashboardRoutes);
const providerDashboardRoutes = require("./routes/providerDashboard.routes");
app.use("/api/provider-dashboard", providerDashboardRoutes);
const roleManagementRoutes = require("./routes/roleManagement.routes");
app.use("/api/role-management", roleManagementRoutes);
const salutationRoutes = require("./routes/salutation.routes");
app.use("/api/salutations", salutationRoutes);
const leadStatusRoutes = require("./routes/leadStatus.routes");
app.use("/api/lead-status", leadStatusRoutes);
const leadStageRoutes = require("./routes/leadStage.routes");
app.use("/api/lead-stage", leadStageRoutes);
const leadSourceRoutes = require("./routes/leadSource.routes");
app.use("/api/lead-source", leadSourceRoutes);
const productBrandRoutes = require("./routes/productBrand.routes");
app.use("/api/product-brand", productBrandRoutes);
const productCategoryRoutes = require("./routes/productCategory.routes");
app.use("/api/product-category", productCategoryRoutes);
const productSubCategoryRoutes = require("./routes/productSubCategory.routes");
app.use("/api/product-sub-category", productSubCategoryRoutes);
const productUnitRoutes = require("./routes/productUnit.routes");
app.use("/api/product-product-unit", productUnitRoutes);
const productRoutes = require("./routes/product.routes");
app.use("/api/product", productRoutes);
const countryRoutes = require("./routes/country.routes");
app.use("/api/country", countryRoutes);
const countryCodeRoutes = require("./routes/countryCode.routes");
app.use("/api/country-code", countryCodeRoutes);
const currencyRoutes = require("./routes/currency.routes");
app.use("/api/currency", currencyRoutes);
const zonesRoutes = require("./routes/zones.routes");
app.use("/api/zones", zonesRoutes);
const employeeRoutes = require("./routes/employee.routes");
app.use("/api/employee", employeeRoutes);
const customerRoutes = require("./routes/customer.routes");
app.use("/api/customer", customerRoutes);
const leadRoutes = require("./routes/lead.routes");
app.use("/api/lead", leadRoutes);
const quotationRoutes = require("./routes/quotation.routes");
app.use("/api/quotation", quotationRoutes);
const orderRoutes = require("./routes/order.routes");
app.use("/api/order", orderRoutes);
const orderPaymentRoutes = require("./routes/orderPayment.routes");
app.use("/api/order-payment", orderPaymentRoutes);
const incentiveRoutes = require("./routes/incentive.routes");
app.use("/api/incentives", incentiveRoutes);
const invoiceRoutes = require("./routes/invoice.routes");
app.use("/api/invoice", invoiceRoutes);
const ticketServiceRoutes = require("./routes/ticketService.routes");
app.use("/api/ticket-service", ticketServiceRoutes);
const ticketPriorityRoutes = require("./routes/ticketPriority.routes");
app.use("/api/ticket-priority", ticketPriorityRoutes);
const ticketRoutes = require("./routes/ticket.routes");
app.use("/api/ticket", ticketRoutes);
const packageRoutes = require("./routes/package.routes");
app.use("/api/package", packageRoutes);
const apiMasterRoutes = require("./routes/apiMaster.routes");
app.use("/api/api-master", apiMasterRoutes);
const customerCategory = require("./routes/customerCategory.routes");
app.use("/api/customer-category", customerCategory);
const industry = require("./routes/industry.routes");
app.use("/api/industry", industry);
const orderStatus = require("./routes/orderStatus.routes");
app.use("/api/order-status", orderStatus);
const landingPageLeadRoutes = require("./routes/landingPageLead.routes");
app.use("/api/landing-page-lead", landingPageLeadRoutes);
const landingPageSetupRoutes = require("./routes/landingPageSetup.routes");
app.use("/api/landing-page-setup", landingPageSetupRoutes);
const prefixRoutes = require("./routes/prefix.routes");
app.use("/api/prefix", prefixRoutes);
const notificationRoutes = require("./routes/notification.routes");
app.use("/api/notifications", notificationRoutes);
const pusherRoutes = require("./routes/pusher.routes");
app.use("/api", pusherRoutes);
const bankDetailsRoutes = require("./routes/bankDetails.routes");
app.use("/api/bank-details", bankDetailsRoutes);
const tAndCAndDecRoutes = require("./routes/tAndCAndDec.routes");
app.use("/api/t-and-c-and-dec", tAndCAndDecRoutes);
const platformConfigRoutes = require("./routes/platformConfig.routes");
app.use("/api/platform-config", platformConfigRoutes);
const automationRoutes = require("./routes/automation.routes");
app.use("/api/automation", automationRoutes);
const aiSuggestionsRoutes = require("./routes/aiSuggestions.routes");
app.use("/api/ai-suggestions", aiSuggestionsRoutes);
const fieldVisitRoutes = require("./routes/fieldVisit.routes");
app.use("/api/field-visits", fieldVisitRoutes);

// ✅ Serve static uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

// Start server
const PORT = process.env.PORT || 8200;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
