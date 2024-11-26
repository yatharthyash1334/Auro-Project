const mongoose = require("mongoose");

// Define the Student schema
const StudentSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Pre-save hook to enforce additional security or transformations if needed
StudentSchema.pre("save", function (next) {
  // Placeholder for any future logic, such as hashing passwords
  next();
});

// Create the Student model
const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;
