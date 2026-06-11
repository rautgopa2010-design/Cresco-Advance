const multer = require("multer");
const path = require("path");
const fs = require("fs");

const leadUploadFolder = path.join(process.cwd(), "uploads/leads");
if (!fs.existsSync(leadUploadFolder)) {
  fs.mkdirSync(leadUploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, leadUploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file format"), false);
};

const uploadLeadFilesMiddleware = multer({ storage, fileFilter });
module.exports = uploadLeadFilesMiddleware;