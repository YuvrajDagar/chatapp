const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// const searchUser = asyncHandler(async (req, res) => {
//   console.log("user searching started");

//   const keyword = req.query.search;
//   console.log(keyword);
//   const result = keyword
//     ? {
//         $or: [
//           { name: { $regex: keyword, $options: "i" } },
//           { email: { $regex: keyword, $options: "i" } },
//         ],
//       }
//     : {};

//   const user = await User.find(result)
//     .find({ _id: { $ne: req.user._id } })
//     .select("-password");
//   console.log("user searching finished");
//   res.send(user);
// });

const chatByUser = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(user);

  if (!user) {
    res.status(400);
    console.log("No authenticated user!");
    throw new Error("No authenticated user!");
  }
  try {
    var chats = await Chat.find({ users: { $elemMatch: { $eq: user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name imgUrl email",
    });
    if (chats.length > 0) {
      console.log("Chat exists!");
    } else {
      console.log("No Chat exists!");
    }

    res.send(chats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param is not received");
    res.status(400);
    throw new Error("UserId param is not received");
  }

  var chat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "name imgUrl email",
  });

  console.log("Found Chat if exists!");

  if (chat.length > 0) {
    console.log("Chat exists!");
    res.send(chat[0]);
  } else {
    console.log("Chat doesn't exists! Creating new Chat");
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createChat = await Chat.create(chatData);
      console.log(`createChat : ${JSON.stringify(createChat)}`);

      const fullChat = await Chat.findOne({
        _id: createChat._id,
      }).populate("users", "-password");
      res.status(200).send(fullChat);
      console.log("Chat created successfully and sent");
    } catch (error) {
      console.log("Error in creating chat");
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  console.log("Checking params");

  if (!req.body.users || !req.body.name) {
    res.status(400);
    throw new Error("Please Fill all the fields");
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res.status(400);
    throw new Error("More than 2 users required");
  }

  console.log("Params Good");

  users.push(req.user);
  console.log("creating new Group Chat");
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: [req.user],
    });

    const fullChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullChat);
    console.log("Created new Group Chat");
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  chat = await Chat.findById(chatId).populate("groupAdmin", "-password");

  if (
    chat.groupAdmin.some((value) => {
      return value._id.toString() === req.user._id.toString();
    })
  ) {
    try {
      var updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          chatName,
        },
        {
          new: true,
        }
      )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    } catch (error) {
      res.status(400);
      throw new Error(erroe.message);
    }
    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.json(updatedChat);
    }
  } else {
    res.status(400);
    throw new Error("User Not Allowed");
  }
});

const addToGroupChat = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  chat = await Chat.findById(chatId).populate("groupAdmin", "-password");

  if (
    chat.groupAdmin.some((value) => {
      return value._id.toString() === req.user._id.toString();
    })
  ) {
    const addedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!addedChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.json(addedChat);
    }
  } else {
    res.status(400);
    throw new Error("User Not Allowed");
  }
});

const removeFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  chat = await Chat.findById(chatId).populate("groupAdmin", "-password");

  if (
    chat.groupAdmin.some((value) => {
      return value._id.toString() === req.user._id.toString();
    })
  ) {
    const removedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removedChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.json(removedChat);
    }
  } else {
    res.status(400);
    throw new Error("User Not Allowed");
  }
});

module.exports = {
  chatByUser,
  accessChat,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
};
