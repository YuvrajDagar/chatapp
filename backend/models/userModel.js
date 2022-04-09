const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //pic: { data: Buffer, contentType: String, required: true },
    imgUrl: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (reqPassword) {
  return await bcrypt.compare(reqPassword, this.password);
};

userSchema.pre("save", async function (next) {
  // if (!this.isModified) {
  //   next();
  // }

  // console.log("Is this working?");
  // console.log(this.name);
  // const salt = await bcrypt.genSalt(15);
  // console.log(this.password);
  // console.log(this.name);
  // console.log("Is this working?2");
  // this.password = await bcrypt.hash(this.password, salt);
  // console.log("Is this working?3");
  // console.log(this.password);
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(15);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
