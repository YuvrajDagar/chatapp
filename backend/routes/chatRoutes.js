const { authenticate } = require("../middleware/authenticate");
const router = require("express").Router();
const {
  chatByUser,
  accessChat,
  createGroupChat,
  renameGroupChat,
  removeFromGroupChat,
  addToGroupChat,
} = require("../controller/chatControllers");
//router.route("/").get(authenticate, searchUser);

router.route("/").get(authenticate, chatByUser);
router.route("/").post(authenticate, accessChat);
router.route("/group").post(authenticate, createGroupChat);
router.route("/rename").put(authenticate, renameGroupChat);
router.route("/add").put(authenticate, addToGroupChat);
router.route("/remove").put(authenticate, removeFromGroupChat);

module.exports = router;
