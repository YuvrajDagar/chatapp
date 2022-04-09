const {
  registerUser,
  loginUser,
  searchUser,
} = require("../controller/userControllers");
const { authenticate } = require("../middleware/authenticate");

const router = require("express").Router();
// for image in mongodb
//const multer = require("multer");
//const path = require("path");
// const storage = multer.diskStorage({
//   destination: "./photo",
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });
//upload.single("photo") to be used in the function below

// router.route("/register").post((req, res) => {
//   console.log("this is working");
// });

router.route("/register").post(registerUser);
router.route("/").get(authenticate, searchUser);
router.route("/login").post(loginUser);

module.exports = router;
