const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
    minLength: [4, "Min Character is 4"],
    maxLength: [30, "Max Character is 4"],
  },

  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
    validate: [validator.isEmail, "Email is invalid"],
  },

  password: {
    type: String,
    required: [true, "Password is Required"],
    minLength: [8, "Min Character is 8"],
    select: false,
  },

  avatar: {
    public_id: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },
  },

  role: {
    type: String,
    default: "user",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPaswordExpire: Date,
});

// Password Encryption before saving new user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};



// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};


module.exports = mongoose.model("User", userSchema);
