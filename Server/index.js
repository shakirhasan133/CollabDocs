require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.port || 5000;
const JWT = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

const corsOption = {
  origin: ["http://localhost:5173"],
  credentials: true, // fixed typo
  optionsSuccessStatus: 200, // fixed spelling
};

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

// Create Token
app.post("/JWT", (req, res) => {
  try {
    const email = req.body;
    const token = JWT.sign(email, process.env.Secret_Key, { expiresIn: "2h" });
    // console.log(token);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({ success: true });
  } catch (error) {}
});

// Remove Token
app.post("/logout", (req, res) => {
  res
    .clearCookie("token", {
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});

app.get("/", (req, res) => {
  res.send("Server is Working");
});

app.listen(port, () => {
  console.log(`Server is Running on : ${port}`);
});
