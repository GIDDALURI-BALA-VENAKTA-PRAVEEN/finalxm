import { Schema, model } from "mongoose";

// const UserSchema = new Schema({
//   name: { type: String, required: true, default: "New User" },
//   email: { type: String, unique: true, required: true },
//   phone: { type: String, default: "" },
// });

// export const User = model("User", UserSchema);
// export default User;

import { Sequelize,DataTypes  } from "sequelize";
import {sequelize} from "../config/db.js";

export const User = sequelize.define("Users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "New User",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
});