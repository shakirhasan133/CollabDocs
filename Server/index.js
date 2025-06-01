require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.port || 5000;
const JWT = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const expressServer = http.createServer(app);

const corsOption = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

const io = new Server(expressServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
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

// Socket Connection Test
// io.on("connection", (socket) => {
//   console.log("new user connected", socket.id);

//   // Send Data from server to client
//   socket.send(data2);

//   // Receive data from client to server
//   socket.on("myData", (data) => {
//     // console.log(data);
//     data2 = data;
//     console.log(data2);
//     io.send(data2);
//   });

//   socket.on("disconnect", () => {
//     console.log("User Disconnected");
//   });
// });

//middleWire
io.use((socket, next) => {
  const cookie = socket.handshake.headers.cookie;
  // const token = cookie
  //   ?.split("; ")
  //   .find((row) => row.startsWith("token="))
  //   ?.split("=")[1];
  socket.user = cookie;
  next();
});

// Get My Documents
const MyDocument = io.of("/my-documents");
const SharedDocuments = io.of("/shared-documents");
const CreateDocuments = io.of("/new-documents");

// MongoDB
const uri = `mongodb+srv://${process.env.DB_UserName}:${process.env.DB_Password}@collabdocs.rbgkqis.mongodb.net/?retryWrites=true&w=majority&appName=CollabDocs`;
const Client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await Client.connect();
    console.log("Database Connection success");

    const database = Client.db("CollabDocs");
    const documentData = database.collection("Documents");

    // Get My Documents
    MyDocument.on("connection", (socket) => {
      socket.on("sendEmail", async ({ email }) => {
        // console.log(email);

        try {
          const result = await documentData
            .find({ userEmail: email })
            .toArray();
          socket.emit("myDocuments", result);
        } catch (error) {
          socket.emit("myDocuments", { status: 404 });
        }
      });
    });

    // Get Shared Documents
    SharedDocuments.on("connection", (socket) => {
      socket.on("sendEmail", async ({ email }) => {
        try {
          const query = { sharedWith: { $in: [email] } };
          const result = await documentData.find(query).toArray();
          socket.emit("sharedDocuments", result);
        } catch (error) {
          socket.emit("sharedDocuments", { status: 404 });
        }
      });
    });

    // Create New Documents
    CreateDocuments.on("connection", (socket) => {
      socket.on("sendEmail", async ({ email }) => {
        try {
          socket.on("sendNewDocData", async (data) => {
            const newDoc = {
              title: data.title,
              userEmail: email,
              description: data.description,
              details: "",
              thumbnailUrl: "",
              lastEdited: "",
              fileCreatedTimestamp: Date.now(),
              fileCreatedUsername: data.userName,
              sharedWith: [data.shareEmail],
              permissions: "",
            };
            const result = await documentData.insertOne(newDoc);

            // console.log(result);

            if (result.acknowledged === true) {
              socket.emit("newDoc", {
                status: 200,
                message: "New Document Created",
              });

              // সকল কানেক্টেড ক্লায়েন্টের মধ্যে যাদের email মিলে, তাদের কাছে ডেটা পাঠান
              for (const [id, clientSocket] of SharedDocuments.sockets) {
                const userEmail = clientSocket.handshake.query.email;
                if (newDoc.sharedWith.includes(userEmail)) {
                  try {
                    const query = { sharedWith: { $in: [userEmail] } };
                    const sharedDocs = await documentData.find(query).toArray();
                    clientSocket.emit("sharedDocuments", sharedDocs);
                  } catch (error) {
                    clientSocket.emit("sharedDocuments", { status: 404 });
                  }
                }
              }
            } else {
              socket.emit("newDoc", {
                status: 404,
                message: "Something Went Wrong",
                id: insertedId,
              });
            }
          });
        } catch (error) {}
      });
    });

    // End
  } catch (error) {
    console.log("Error Came from DB Connection", error);
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Working");
});

expressServer.listen(port, () => {
  console.log(`Server is Running on : ${port}`);
});
