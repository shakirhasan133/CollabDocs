require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.port || 5000;
const JWT = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

// NameSpace
const MyDocument = io.of("/my-documents");
const SharedDocuments = io.of("/shared-documents");
const CreateDocuments = io.of("/new-documents");
const getActiveUsers = io.of("/active-users");
const getDocumentDetails = io.of("/document-details");
const documentDetailsUpdate = io.of("/document-details-update");
const DeleteDocument = io.of("/deleteDocument");
const ShareWithOther = io.of("/share-with-others");

let activeUser = [];

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
    const UserData = database.collection("Users");

    // set User Data at DB
    app.post("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email };
        const user = req.body;

        const isExist = await UserData.findOne(query);
        if (isExist) {
          return;
          // res.send("Already Registered");
        }

        const result = await UserData.insertOne({
          ...user,
          role: "User",
          timestamp: Date.now(),
        });

        res.send(result);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    // Get Active Users List
    getActiveUsers.on("connection", (socket) => {
      const { email, name, photoURL } = socket.handshake.query;

      socket.on("getOfflineUserData", (data) => {
        const email = data.email;
        console.log(email);
      });
      socket.email = email;

      if (
        activeUser.length === 0 ||
        !activeUser.some((user) => user.email === email)
      ) {
        activeUser.push({ email, name, photoURL });
        getActiveUsers.emit("getActive-User", activeUser);
      }
      // activeUser.push({ email, name, photoURL });
      getActiveUsers.emit("getActive-User", activeUser);

      socket.emit("newConnectionConfirm", "Hello World");

      //

      socket.on("disconnect", () => {
        if (socket.email) {
          const index = activeUser.findIndex(
            (user) => user.email === socket.email
          );
          if (index !== -1) {
            activeUser.splice(index, 1);
            getActiveUsers.emit("getActive-User", activeUser);
          }
        }
      });
    });

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
      let userEmail = "";
      socket.on("sendEmail", async ({ email }) => {
        userEmail = email;

        socket.on("sendNewDocData", async (data) => {
          try {
            const newDoc = {
              title: data.title,
              userEmail: userEmail,
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
                id: result.insertedId,
              });

              // send data to shared email
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
              });
            }
          } catch (error) {
            console.log("From CreatedDoc", error);
          }
        });
      });
    });

    // Get Documents Details
    getDocumentDetails.on("connection", (socket) => {
      socket.on("sendDetailsData", async (data) => {
        const { email, id } = data;

        try {
          const query = {
            _id: new ObjectId(id),
            $or: [{ userEmail: email }, { sharedWith: { $in: [email] } }],
          };

          const result = await documentData.findOne(query);

          socket.emit("getDocumentDetails", result);
        } catch (error) {
          console.error("Error fetching document:", error);
          socket.emit("getDocumentDetails", {
            error: "Failed to fetch document",
          });
        }
      });
    });

    // Update Document Data
    documentDetailsUpdate.on("connection", (socket) => {
      // console.log("User Connected", socket.id);

      socket.on("UpdateDetails", async (data) => {
        // console.log(data);

        const { email, id, title, details } = data;

        try {
          const query = {
            _id: new ObjectId(id),
            $or: [{ userEmail: email }, { sharedWith: { $in: [email] } }],
          };

          const upDoc = {
            $set: {
              title: title,
              details: details,
              lastEdited: Date.now(),
            },
          };

          const result = await documentData.updateOne(query, upDoc);
          // console.log(result);
          if (result.acknowledged === true) {
            const updateDoc = await documentData.findOne({
              _id: new ObjectId(id),
            });
            for (const [id, clientSocket] of getDocumentDetails.sockets) {
              const clientEmail = clientSocket.handshake.query.email;

              if (
                updateDoc.userEmail === clientEmail ||
                updateDoc.sharedWith.includes(clientEmail)
              ) {
                const query = {
                  _id: new ObjectId(id),
                  $or: [{ userEmail: email }, { sharedWith: { $in: [email] } }],
                };
                const data = await documentData.findOne(query);

                clientSocket.emit("getDocumentDetails", data);
              }
            }
          }
        } catch (error) {}
      });
    });

    const handleDeleteOrUnshare = async (email, id) => {
      try {
        const query = { _id: new ObjectId(id) };
        const document = await documentData.findOne(query);
        // console.log(email, id);

        if (!document) {
          return { status: "error", message: "Document Not Found" };
        }
        if (document.userEmail === email) {
          const result = await documentData.deleteOne(query);
          return result;
        }
        if (document.sharedWith && document.sharedWith.includes(email)) {
          const result = await documentData.updateOne(query, {
            $pull: {
              sharedWith: email,
            },
          });

          return result;
        }

        return { status: "error", message: "Unauthorized" };
      } catch (error) {
        return { status: "error", message: "Server error" };
      }
    };

    // Delete a Document
    DeleteDocument.on("connection", async (socket) => {
      // const { email, id } = socket.handshake.query;
      // console.log(email, id);

      socket.on("sendDataForDelete", async (data) => {
        handleDeleteOrUnshare(data.email, data.id).then(async (res) => {
          socket.emit("DeleteResult", res);

          if (res.acknowledged) {
            // Send Updated Data
            for (const [id, clientSocket] of MyDocument.sockets) {
              const clientEmail = clientSocket.handshake.query.email;
              const query = { userEmail: clientEmail };
              const result = await documentData.find(query).toArray();
              clientSocket.emit("myDocuments", result);
            }

            for (const [id, clientSocket] of SharedDocuments.sockets) {
              const clientEmail = clientSocket.handshake.query.email;
              const query2 = {
                sharedWith: {
                  $in: [clientEmail],
                },
              };
              const result2 = await documentData.find(query2).toArray();
              clientSocket.emit("sharedDocuments", result2);
            }
          }
        });
      });
    });

    // HandleShareFunctionalily
    const handleShare = async (email, id, shareemail) => {
      // console.log(email, id, shareemail);
      try {
        const query = { _id: new ObjectId(id), userEmail: email };
        const document = await documentData.findOne(query);
        if (!document) {
          return { status: "error", message: "Document not found" };
        }
        if (document) {
          const upDoc = {
            $addToSet: {
              sharedWith: shareemail,
            },
          };
          const result = await documentData.updateOne(query, upDoc);
          return result;
        }
      } catch (error) {}
    };
    // Shared Documents
    ShareWithOther.on("connection", (socket) => {
      const { email, id } = socket.handshake.query;

      socket.on("getShareWithEmail", (data) => {
        handleShare(email, id, data).then(async (res) => {
          // console.log(res);
          if (res && res.acknowledged === true) {
            // Send Response
            socket.emit("shareResponse", {
              status: true,
              message: "Share successful",
            });
            for (const [id, clientSocket] of SharedDocuments.sockets) {
              const clientEmail = clientSocket.handshake.query.email;
              const query2 = {
                sharedWith: {
                  $in: [clientEmail],
                },
              };
              const result2 = await documentData.find(query2).toArray();
              clientSocket.emit("sharedDocuments", result2);
            }
          } else {
            socket.emit("shareResponse", {
              status: false,
              message: "Something went wrong",
            });
          }
        });
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
