const mongoose = require("mongoose");

// Define the Intern schema
const InternSchema = new mongoose.Schema(
  {
    CompanyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    JobRole: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    Stipend: {
      type: Number,
      default: 0,
      min: [0, "Stipend cannot be negative"],
    },
    CutOff: {
      type: Number,
      default: 0.0,
      min: [0, "Cutoff cannot be negative"],
      max: [100, "Cutoff cannot exceed 100"],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Index for quick search on CompanyName and JobRole
InternSchema.index({ CompanyName: 1, JobRole: 1 });

// Create the Intern model
const Intern = mongoose.model("Intern", InternSchema);

module.exports = Intern;
