const mongoose = require("mongoose");

const clientSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    ceoName: {
      type: String,
      required: true,
    },
    phone: [{ type: Object, required: true }],
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const client = mongoose.model("client", clientSchema);
module.exports = { client };
