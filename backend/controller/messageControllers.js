const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passed by user");
    res.status(400);
    throw new Error("Content or ChatId is missing");
  }

  var messageToSend = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(messageToSend);
    console.log(message);

    message = await message.populate("sender", "-password");
    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name imgUrl email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
      isNewChat: true,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const fetchMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "-password")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, fetchMessages };
