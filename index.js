import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import fs from "fs"

import cors from "cors"

import { checkAuth, handleValidationErrors } from "./utils/index.js"
import {
  UserController,
  PostController,
  CommentController,
} from "./controllers/index.js"
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  commentCreateValidation,
} from "./validations.js"

const MONGODB_KEY = "my-private-mongoDB-connect-key"

mongoose
  .connect(`${MONGODB_KEY}`)
  .then(() => console.log("DB Ok"))
  .catch((err) => console.log("DB Error", err))

const app = express()

const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads")
    }
    callback(null, "uploads")
  },
  filename: (_, file, callback) => {
    callback(null, file.originalname)
  },
})

const upload = multer({ storage })

app.use(express.json())

app.use(cors())

app.use("/uploads", express.static("uploads"))

// ===================== Endpoints authorization, loninization =======
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
)
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
)
app.get("/auth/me", checkAuth, UserController.getMe)
app.delete("/auth/delete/:id", checkAuth, UserController.deleteAccount)

// ===================== get user ======================================
app.get("/user/:id", UserController.getUser)

// ===================== Endpoints loading image =======================
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  })
})

// ===================== Endpoints posts ===============================
app.get("/tags", PostController.getPopularsTags)
app.get("/tag", PostController.getTag)
app.get("/posts", PostController.getAll)
app.get("/userposts", PostController.userPosts)
app.get("/posts/:id", PostController.getOne)
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
)
app.delete("/posts/:id", checkAuth, PostController.remove)
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
)

// ===================== Endpoints comments =============================
app.get("/comments/:id", CommentController.getPostComments)
app.delete(
  "/post/:postId/comments/:commentId",
  checkAuth,
  CommentController.removeComment
)

app.post(
  "/comments",
  checkAuth,
  handleValidationErrors,
  commentCreateValidation,
  CommentController.createComments
)

// Create the name of the port in the localhost, display the result or an error
app.listen(9999, (err) => {
  if (err) {
    return console.log(err)
  }

  console.log("Server OK")
})
