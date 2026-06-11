const router = require("express").Router();
const { check } = require("express-validator");
const controller = require("../controllers/employee.controller");
const auth = require("../middleware/auth.middleware");

const employeeValidation = [
  check("salutation", "Salutation is required").notEmpty(),
  check("firstName", "First name is required").notEmpty(),
  check("lastName", "Last name is required").notEmpty(),
  check("mobile", "Mobile is required").notEmpty(),
  check("email", "Valid email is required").isEmail(),
  check("role.id", "Role is required").notEmpty(),
  check("permanentAddress.street", "Street is required").notEmpty(),
  check("permanentAddress.state", "State is required").notEmpty(),
  check("permanentAddress.country", "Country is required").notEmpty(),
  check("permanentAddress.city", "City is required").notEmpty(),
  check("permanentAddress.pincode", "Pincode is required").notEmpty(),
];

router.post("/create", auth, [...employeeValidation, check("password", "Password is required").notEmpty()], controller.createEmployee);
router.get("/", auth, controller.getAllEmployees);
router.put("/edit/:id", auth, employeeValidation, controller.updateEmployee);
router.delete("/:id", auth, controller.deleteEmployee);

module.exports = router;
