const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, imgUrl } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    console.log(name);
    console.log(email);
    console.log(password);
    throw new Error("Please Enter all the fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  //   var img = {
  //     data: fs.readFileSync(
  //       path.join(__dirname + "/photo/" + req.file.filename)
  //     ),
  //     contentType: "image/png",
  //   };

  //   if(!img){
  //       img = {
  //         data: fs.readFileSync(
  //           path.join(__dirname + "/photo/" + 'connection-lost')
  //         ),
  //         contentType: "image/png",
  //       };
  //   }

  var obj = {
    name: name,
    email: email,
    password: password,
    imgUrl: imgUrl,
  };

  const user = await User.create(obj);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      imgUrl: user.imgUrl,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the User");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  //  console.log(user);

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      imgUrl: user.imgUrl,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email or Password");
  }
});

const searchUser = asyncHandler(async (req, res) => {
  console.log("user searching started");

  const keyword = req.query.search;
  console.log(keyword);
  const result = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ],
      }
    : {};

  const user = await User.find(result)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");
  console.log("user searching finished");
  res.send(user);
});

module.exports = { registerUser, loginUser, searchUser };
