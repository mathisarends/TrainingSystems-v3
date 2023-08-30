const multer = require("multer");
const path = require("path");

// Definiere Speicherort und Dateinamen für die Profilbilder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/profiles"); // Speicherort für hochgeladene Bilder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, "profile-picture-" + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;