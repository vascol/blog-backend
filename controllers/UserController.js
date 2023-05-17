import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import UserModel from "../models/User.js"
import PostModel from "../models/Post.js"
import CommentModel from "../models/Comment.js"

// user registration
export const register = async (request, response) => {
  try {
    const password = request.body.password

    const salt = await bcrypt.genSalt(10)

    const hash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
      fullName: request.body.fullName,
      email: request.body.email,
      passwordHash: hash,
      avatarUrl: request.body.avatarUrl,
    })

    const user = await doc.save()

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    )

    const { passwordHash, ...userData } = user._doc

    response.json({
      ...userData,
      token,
    })
  } catch (err) {
    console.log(err)
    response.status(500).json({
      message: "Failed to register",
    })
  }
}

// user logIn
export const login = async (request, response) => {
  try {
    const user = await UserModel.findOne({
      email: request.body.email,
    })

    if (!user) {
      return response.status(404).json({
        message: "No user found",
      })
    }

    const isValidPass = await bcrypt.compare(
      request.body.password,
      user._doc.passwordHash
    )

    if (!isValidPass) {
      return response.status(400).json({
        message: "Invalid login or password",
      })
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    )

    const { passwordHash, ...userData } = user._doc

    response.json({
      ...userData,
      token,
    })
  } catch (error) {
    console.log(error)
    response.json({
      message: "Failed to authenticate",
    })
  }
}

// get me
export const getMe = async (request, response) => {
  try {
    const user = await UserModel.findOne({
      userId: request.userId,
    })

    if (!user) {
      return response.status(404).json({
        message: "No user found",
      })
    }

    const { passwordHash, ...userData } = user._doc

    response.json(userData)
  } catch (err) {
    console.log(err)
    response.status(500).json({
      message: "Failed to authenticate",
    })
  }
}

// delete account
export const deleteAccount = async (req, res) => {
  const { id } = req.params

  try {
    // delete all user posts
    PostModel.deleteMany(
      {
        user: id,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete all posts",
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: "Failed to delete all posts by a user",
          })
        }
      }
    )

    // delete all user coments
    CommentModel.deleteMany(
      {
        user: id,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete user comments",
          })
        }
        if (!doc) {
          return res.status(500).json({
            message: "Doc not found. Failed to delete user comments",
          })
        }
      }
    )

    // delete user
    UserModel.findOneAndDelete(
      {
        _id: id,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete user",
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: "Doc, not found. Failed to delete user",
          })
        }
      }
    )

    res.json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "The user has not been deleted!",
    })
  }
}

//  getUser
export const getUser = async (req, res) => {
  const id = req.params.id

  try {
    const user = await UserModel.findOne({
      _id: id,
    })

    if (!user) {
      return response.status(404).json({
        message: "No user found",
      })
    }

    res.json(user)
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "No user found!",
    })
  }
}
