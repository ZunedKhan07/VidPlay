import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: [true, "fullNmae is required"],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    avatar: {
      type: String, // claudinary se link as a string le lenge
      requeired: [true, "Avatar is required"],
    },

    coverImage: {
      type: String, // claudinary se link as a string le lenge
    },

    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },

    refreshToken: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  //arrow func me this word ka assecc nhi milta
  await bcrypt.compare(password, this.password);
};

(userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
      process.env.ACCESS_TOKEN_SECRET,
    {
      expairesIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
}),
  (userSchema.methods.genetareRefreshToken = function () {
    return jwt.sign(
      {
        _id: this._id,
      },
        process.env.ACCESS_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
  });

export const User = mongoose.model("User", userSchema);
