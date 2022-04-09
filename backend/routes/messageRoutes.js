const { authenticate } = require("../middleware/authenticate");
const router = require("express").Router();

const {
  sendMessage,
  fetchMessages,
} = require("../controller/messageControllers");

router.route("/send").post(authenticate, sendMessage);
router.route("/:chatId").get(authenticate, fetchMessages);

module.exports = router;
