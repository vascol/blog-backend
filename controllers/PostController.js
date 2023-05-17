import PostModel from "../models/Post.js"
import CommentModel from "../models/Comment.js"

// view all posts
export const getAll = async (req, res) => {
  const { page = 1, limit = 10, search, category, userId } = req.query

  try {
    const posts = await PostModel.find(
      category === "2"
        ? {
            user: {
              _id: userId,
            },
            title: new RegExp(search, "i"),
          }
        : { title: new RegExp(search, "i") }
    )
      .populate("user")
      .sort(category === "0" ? { createdAt: -1 } : { viewsCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await PostModel.find(
      category === "2"
        ? {
            user: {
              _id: userId,
            },
            title: new RegExp(search, "i"),
          }
        : { title: new RegExp(search, "i") }
    ).countDocuments()

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to fetch posts",
    })
  }
}

// view my posts
export const userPosts = async (req, res) => {
  const { page = 1, limit = 10, search, category, userId } = req.query

  try {
    const posts = await PostModel.find({
      user: {
        _id: userId,
      },
    })
      .populate("user")
      .sort({
        createdAt: -1,
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await PostModel.find({
      user: {
        _id: userId,
      },
    }).countDocuments()

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to fetch posts",
    })
  }
}

// view one post
export const getOne = (req, res) => {
  try {
    const postId = req.params.id

    PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to fetch post",
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: "Post not found",
          })
        }

        res.json(doc)
      }
    ).populate("user")
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to fetch posts",
    })
  }
}

// create new post
export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags.split(","),
      imageUrl: req.body.imageUrl,
      user: req.userId,
    })

    const post = await doc.save()

    res.json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to create post",
    })
  }
}

// remove post
export const remove = async (req, res) => {
  try {
    const postId = req.params.id

    PostModel.findOneAndDelete(
      {
        _id: postId,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete post",
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: "doc not found, failed to delete post",
          })
        }

        res.json({
          success: true,
        })
      }
    )

    // delete all comments on the post
    CommentModel.deleteMany(
      {
        post: postId,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete comments",
          })
        }
        if (!doc) {
          return res.status(500).json({
            message: "doc not found, failed to delete comments",
          })
        }
      }
    )
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to delete post",
    })
  }
}

// update post
export const update = async (req, res) => {
  try {
    const postId = req.params.id

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags.split(","),
        imageUrl: req.body.imageUrl,
        user: req.userId,
      }
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to update article",
    })
  }
}

// get populars tags
export const getPopularsTags = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ viewsCount: -1 })
      .limit(10)
      .exec()

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .filter((obj) => obj !== "")
      .slice(0, 5)

    const tag = [...new Set(tags)]

    res.json(tag)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to get tags",
    })
  }
}

// get one tag
export const getTag = async (req, res) => {
  const { page = 1, limit = 10, tag } = req.query

  try {
    const posts = await PostModel.find({ tags: tag })
      .populate("user")
      .sort({ viewsCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await PostModel.find({ tags: tag }).countDocuments()

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to get tag",
    })
  }
}
