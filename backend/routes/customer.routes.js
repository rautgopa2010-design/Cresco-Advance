const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/customer.controller");
const auth = require("../middleware/auth.middleware");
const checkPermission = require("../middleware/checkPermission.middleware");

// const customerValidation = [
//   check("salutation", "Salutation is required").notEmpty(),
//   check("firstName", "First name is required").notEmpty(),
//   check("lastName", "Last name is required").notEmpty(),
//   check("mobile", "Mobile is required").notEmpty(),
//   check("email", "Email is required").isEmail(),
//   check("customerCategory", "Customer category is required").notEmpty(),
//   check("industry", "Industry is required").notEmpty(),
//   check("leadSource", "Lead Source is required").notEmpty(),
//   check("assignedTo", "At least one assigned employee is required").isArray({ min: 1 })
// ];

const customerValidation = [
  check("salutation", "Salutation is required").notEmpty(),
  check("firstName", "First name is required").notEmpty(),
  check("lastName", "Last name is required").notEmpty(),
  check("mobile", "Mobile is required").notEmpty(),
  check("email", "Email is required").isEmail(),
  check("customerCategory", "Customer category is required").notEmpty(),
  check("industry", "Industry is required").notEmpty(),
  check("leadSource", "Lead Source is required").notEmpty(),
  check("assignedTo", "At least one assigned employee is required").isArray({ min: 1 }),
  
  // Billing Address Validations
  check("billingStreet", "Billing Street is required").notEmpty(),
  check("billingCity", "Billing City is required").notEmpty(),
  check("billingState", "Billing State is required").notEmpty(),
  check("billingPincode", "Billing Pincode is required").notEmpty(),
  check("billingCountry", "Billing Country is required").notEmpty(),
  
  // Shipping Address Validations
  check("shippingStreet", "Shipping Street is required").notEmpty(),
  check("shippingCity", "Shipping City is required").notEmpty(),
  check("shippingState", "Shipping State is required").notEmpty(),
  check("shippingPincode", "Shipping Pincode is required").notEmpty(),
  check("shippingCountry", "Shipping Country is required").notEmpty()
];

const contactValidation = [
  check("salutation", "Salutation is required").notEmpty(),
  check("firstName", "First name is required").notEmpty(),
  check("lastName", "Last name is required").notEmpty(),
  check("mobile", "Mobile is required").notEmpty(),
  check("email", "Valid email is required").isEmail(),
];

router.post(
  "/create",
  auth,
  checkPermission("enquiry_create"),
  customerValidation,
  controller.createCustomer
);

router.post(
  "/:customer_id/contact",
  auth,
  checkPermission("enquiry_edit"),
  contactValidation,
  controller.createCustomerContact
);

router.get(
  "/",
  auth,
  checkPermission("enquiry_view"),
  controller.getAllCustomers
);

router.put(
  "/edit/:id",
  auth,
  checkPermission("enquiry_edit"),
  customerValidation,
  controller.updateCustomer
);

router.put(
  "/:customer_id/contact/:contact_id",
  auth,
  checkPermission("enquiry_edit"),
  contactValidation,
  controller.updateCustomerContact
);

router.delete(
  "/:id",
  auth,
  checkPermission("enquiry_delete"),
  controller.deleteCustomer
);

router.delete(
  "/:customer_id/contact/:contact_id",
  auth,
  checkPermission("enquiry_edit"),
  controller.deleteCustomerContact
);

router.post(
  "/import",
  auth,
  checkPermission("enquiry_create"),
  controller.importCustomers
);

router.post(
  "/bulk-assign",
  auth,
  checkPermission("enquiry_edit"),
  controller.bulkAssignCustomers
);

module.exports = router;
