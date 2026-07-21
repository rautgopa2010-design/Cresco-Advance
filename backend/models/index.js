const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("../config/db.config");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: false,
});

// Connect DB
sequelize
  .authenticate()
  .then(() => console.log("✅ Connected to the database."))
  .catch((err) => console.error("❌ DB connection failed:", err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.register = require("./Register")(sequelize, Sequelize);
db.users = require("./Users")(sequelize, Sequelize);
db.employee = require("./Employee")(sequelize, Sequelize);
db.companySetup = require("./CompanySetup")(sequelize, Sequelize);
db.incentiveFormulaMaster = require("./IncentiveFormulaMaster")(
  sequelize,
  Sequelize
);
db.assignedIncentives = require("./AssignedIncentives")(sequelize, Sequelize);
db.employeeIncentives = require("./EmployeeIncentives")(sequelize, Sequelize);
db.profile = require("./Profile")(sequelize, Sequelize);
db.customer = require("./Customer")(sequelize, Sequelize);
db.customerContact = require("./CustomerContact")(sequelize, Sequelize);
db.roles = require("./Roles")(sequelize, Sequelize);
db.rolePermissions = require("./RolePermissions")(sequelize, Sequelize);
db.permissions = require("./Permissions")(sequelize, Sequelize);
db.modules = require("./Modules")(sequelize, Sequelize);
db.salutation = require("./Salutation")(sequelize, Sequelize);
db.leadStatus = require("./LeadStatus")(sequelize, Sequelize);
db.leadStage = require("./LeadStage")(sequelize, Sequelize);
db.leadSource = require("./LeadSource")(sequelize, Sequelize);
db.productBrand = require("./ProductBrand")(sequelize, Sequelize);
db.productCategory = require("./ProductCategory")(sequelize, Sequelize);
db.productSubCategory = require("./ProductSubCategory")(sequelize, Sequelize);
db.productUnit = require("./ProductUnit")(sequelize, Sequelize);
db.product = require("./Product")(sequelize, Sequelize);
db.country = require("./Country")(sequelize, Sequelize);
db.countryCode = require("./CountryCode")(sequelize, Sequelize);
db.currency = require("./Currency")(sequelize, Sequelize);
db.zones = require("./Zones")(sequelize, Sequelize);
db.lead = require("./leads-followup/Lead")(sequelize, Sequelize);
db.leadProduct = require("./leads-followup/LeadProduct")(sequelize, Sequelize);
db.followup = require("./leads-followup/Followup")(sequelize, Sequelize);
db.quotation = require("./quotation")(sequelize, Sequelize);
db.order = require("./Order")(sequelize, Sequelize);
db.orderPaymentSchedule = require("./OrderPaymentSchedule")(
  sequelize,
  Sequelize
);
db.orderPayment = require("./OrderPayment")(sequelize, Sequelize);
db.invoice = require("./Invoice")(sequelize, Sequelize);
db.ticketService = require("./TicketService")(sequelize, Sequelize);
db.ticketPriority = require("./TicketPriority")(sequelize, Sequelize);
db.ticket = require("./Ticket")(sequelize, Sequelize);
db.package = require("./Package")(sequelize, Sequelize);
db.payment = require("./Payment")(sequelize, Sequelize);
db.packageModules = require("./PackageModules")(sequelize, Sequelize);
db.apiMaster = require("./APIMaster")(sequelize, Sequelize);
db.apiLead = require("./APILead")(sequelize, Sequelize);
db.landingPageLead = require("./landingPageLead")(
  sequelize,
  Sequelize.DataTypes
);
db.customerCategory = require("./CustomerCategory")(sequelize, Sequelize);
db.industry = require("./Industry")(sequelize, Sequelize);
db.orderStatus = require("./OrderStatus")(sequelize, Sequelize);
db.landingPageSetup = require("./landingPageSetup")(sequelize, Sequelize);
db.prefix = require("./prefix")(sequelize, Sequelize);
db.notification = require("./notification")(sequelize, Sequelize);
db.bankDetails = require("./BankDetails")(sequelize, Sequelize);
db.t_and_c_and_dec = require("./TAndCAndDec")(sequelize, Sequelize);
db.fieldVisit = require("./FieldVisit")(sequelize, Sequelize);

// Setup association
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sync models with DB
db.sequelize
  .sync({ alter: true }) // database updates automatically based on models (It will donot loss data, but gives column erros)
  // .sync({ force: true }) // drops and recreates all tables based on the models. (It will loss data, but prevent column erros)
  // so safest method is drop table manually
  .then(() => console.log("✅ Tables synced."));

module.exports = db;
