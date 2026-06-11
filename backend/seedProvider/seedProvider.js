const bcrypt = require("bcryptjs");
const db = require("../models");

const {
  register: Register,
  users: Users,
  roles: Roles,
  employee: Employee,
  companySetup: CompanySetup,
  profile: Profile,
} = db;

async function seedProvider() {
  try {
    const hashedPassword = await bcrypt.hash("Divyanshu07@", 10);

    const existingCompany = await Register.findOne({
      where: { company: "Cresco Software Solutions" },
    });
    const existingRole = await Roles.findOne({ where: { role_name: "Super Provider Admin" } });
    const existingUser = await Users.findOne({ where: { email: "admin@crescosoft.com" } });
    const existingEmployee = await Employee.findOne({ where: { email: "admin@crescosoft.com" } });

    if (existingCompany || existingRole || existingUser || existingEmployee) {
      console.log("⚠️ Seed skipped: Provider Super Admin already exists!");
      process.exit(0);
    }

    // 1) Create provider org
    const org = await Register.create({
      providerId: null, // set after we get org.id
      company: "Cresco Software Solutions",
      firstName: "Gopal",
      middleName: "",
      lastName: "Raut",
      mobile: "+91 8080288194",
      email: "admin@crescosoft.com",
      packageDetails: "Provider",
      password: hashedPassword,
    });

    // make provider reference itself
    await org.update({ providerId: org.id });

    // 2) Super Provider Admin role
    const role = await Roles.create({
      org_id: org.id,
      role_name: "Super Provider Admin",
    });

    // 3) User with providerId
    const user = await Users.create({
      org_id: org.id,
      role_id: role.id,
      providerId: org.id,
      email: "admin@crescosoft.com",
      mobile: "+91 8080288194",
      password: hashedPassword,
    });

    // 4) Employee with providerId
    await Employee.create({
      org_id: org.id,
      role_id: role.id,
      user_id: user.id,
      providerId: org.id,
      salutation: "Mr.",
      firstName: "Gopal",
      middleName: "",
      lastName: "Raut",
      email: "admin@crescosoft.com",
      mobile: "+91 8080288194",
      password: hashedPassword,
    });

    // 5) CompanySetup entry
    await CompanySetup.create({
      org_id: org.id,
      providerId: org.id,
      role_id: role.id,
      user_id: user.id,
      companyName: "Cresco Software Solutions",
      gstinNumber: null,
      salutation: "Mr.",
      firstName: "Gopal",
      middleName: "",
      lastName: "Raut",
      mobile: "+91 8080288194",
      email: "admin@crescosoft.com",
      supportedMobile: null,
      supportedEmail: null,
      companyLogo: null,
    });

    // 6) Profile entry
    await Profile.create({
      org_id: org.id,
      providerId: org.id,
      role_id: role.id,
      user_id: user.id,
      companyName: "Cresco Software Solutions",
      gstinNumber: null,
      salutation: "Mr.",
      firstName: "Gopal",
      middleName: "",
      lastName: "Raut",
      mobile: "+91 8080288194",
      email: "admin@crescosoft.com",
      profileImage: null,
      password: hashedPassword,
    });

    console.log("✅ Provider Super Admin seeded successfully (with CompanySetup & Profile)!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding provider:", err);
    process.exit(1);
  }
}

seedProvider();
