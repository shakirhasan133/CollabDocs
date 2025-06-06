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
  origin: ["http://localhost:5173", "https://collab-docs-ruddy.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};

const io = new Server(expressServer, {
  cors: {
    origin: ["http://localhost:5173", "https://collab-docs-ruddy.vercel.app"],
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
const getDocumentDetails = io.of("/document-details");
const documentDetailsUpdate = io.of("/document-details-update");
const DeleteDocument = io.of("/deleteDocument");
const ShareWithOther = io.of("/share-with-others");

const DocumentsDetailsPage = io.of("document-details-page");

const documentCache = {};

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

    // Online User in a document
    let onlineUsersByDoc = {};

    io.of("/document-room").on("connection", (socket) => {
      socket.on("join-document", (data) => {
        const { name, photo, email, docID } = data;

        socket.docID = docID;
        socket.email = email;

        const userData = {
          SocketID: socket.id,
          UserName: name,
          UserPhoto: photo,
          userEmail: email,
        };

        // Initialize docID list if not exists
        if (!onlineUsersByDoc[docID]) {
          onlineUsersByDoc[docID] = [];
        }

        const alreadyExist = onlineUsersByDoc[docID].some(
          (u) => u.userEmail === email
        );

        if (!alreadyExist) {
          onlineUsersByDoc[docID].push(userData);
        }

        //  Send existing active users to this newly connected user only
        socket.emit("GetOnlineUser", onlineUsersByDoc[docID]);

        //  Broadcast updated list to everyone else in the same room
        socket.join(docID);
        socket.to(docID).emit("GetOnlineUser", onlineUsersByDoc[docID]);
      });

      socket.on("disconnect", () => {
        const docID = socket.docID;
        if (docID && onlineUsersByDoc[docID]) {
          onlineUsersByDoc[docID] = onlineUsersByDoc[docID].filter(
            (u) => u.SocketID !== socket.id
          );
          io.of("/document-room")
            .to(docID)
            .emit("GetOnlineUser", onlineUsersByDoc[docID]);
        }
      });
    });

    // Get My Documents
    MyDocument.on("connection", (socket) => {
      socket.on("sendEmail", async ({ email }) => {
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

    // // Documents Details New
    DocumentsDetailsPage.on("connection", (socket) => {
      socket.on("sendDetailsData", async (data) => {
        const { email, id } = data;

        try {
          const query = {
            _id: new ObjectId(id),
            $or: [{ userEmail: email }, { sharedWith: { $in: [email] } }],
          };
          const result = await documentData.findOne(query);

          socket.join(id); // join room by doc ID
          socket.emit("getDocumentDetails", result);
        } catch (error) {
          socket.emit("getDocumentDetails", {
            error: "Failed to fetch document",
          });
        }
      });

      socket.on("UpdateNewDocument", async (data) => {
        const { email, id, title, details } = data;

        // Store or update document in memory cache
        if (!documentCache[id]) {
          documentCache[id] = { title, details, timer: null };
        } else {
          documentCache[id].title = title;
          documentCache[id].details = details
            ? details
            : documentCache[id].details;
        }

        // Clear existing timer if already set
        if (documentCache[id].timer) {
          clearTimeout(documentCache[id].timer);
        }

        // Set new timer for 2 seconds
        documentCache[id].timer = setTimeout(async () => {
          try {
            const query = {
              _id: new ObjectId(id),
              $or: [{ userEmail: email }, { sharedWith: { $in: [email] } }],
            };

            const upDoc = {
              $set: {
                title: documentCache[id].title,
                details: documentCache[id].details,
                lastEdited: Date.now(),
              },
            };

            const result = await documentData.updateOne(query, upDoc);

            if (result.acknowledged) {
              const updatedDoc = await documentData.findOne({
                _id: new ObjectId(id),
              });
              DocumentsDetailsPage.to(id).emit(
                "getDocumentDetails",
                updatedDoc
              );
            }
          } catch (error) {
            console.log("Update error:", error);
          }
        }, 2000); // Wait 2 seconds after last change
      });

      socket.on("disconnect", () => {
        // Optionally cleanup if needed
      });
    });

    // Share or delete
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
        const { email, id, shareEmail } = data;
        handleShare(email, id, shareEmail).then(async (res) => {
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
