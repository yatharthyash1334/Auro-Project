const mongoose = require("mongoose");

// Define the application schema
const ApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    resume: {
      type: String,
      required: [true, "Resume URL is required"],
      validate: {
        validator: function (value) {
          return /^https?:\/\/\S+/.test(value); // Validate URL format
        },
        message: "Invalid resume URL",
      },
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the application model
const Application = mongoose.model("Application", ApplicationSchema);

module.exports = Application;
