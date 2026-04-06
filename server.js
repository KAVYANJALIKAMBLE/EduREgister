const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ROUTES
const studentRoutes = require("./routes/students");
app.use("/students", studentRoutes);

// START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
