const mongoose = require("mongoose");

// Define the company schema
const CompanySchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Ensure unique indexing for the username field
CompanySchema.index({ username: 1 }, { unique: true });

// Hash password before saving
CompanySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password hasn't been modified
  const bcrypt = require("bcrypt");
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Create the company model
const Company = mongoose.model("Company", CompanySchema);

module.exports = Company;
