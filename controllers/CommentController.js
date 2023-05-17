import CommentModel from "../models/Comment.js"
import PostModel from "../models/Post.js"

// create new comments
export const createComments = async (req, res) => {
  try {
    const doc = new CommentModel({
      text: req.body.text,
      user: req.body.userId,
      post: req.body.postId,
    })

    const comment = await doc.save()

    await PostModel.updateOne(
      {
        _id: req.body.postId,
      },
      {
        $inc: { commentCount: 1 },
      }
    )

    res.json(comment)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Could not create comment",
    })
  }
}

// get post comments
export const getPostComments = async (req, res) => {
  try {
    const id = req.params.id

    const comments = await CommentModel.find({
      post: {
        _id: id,
      },
    })
      .populate("user")
      .sort({
        createdAt: 1,
      })
      .exec()

    res.json(comments)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Could not get comments",
    })
  }
}

// remove comment
export const removeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params

    CommentModel.findOneAndDelete(
      {
        _id: commentId,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete comment",
          })
        }

        if (!doc) {
          return res.status(404).json({
            message: "doc not found, failed to delete comment",
          })
        }

        res.json({
          success: true,
        })
      }
    )

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        $inc: { commentCount: -1 },
      }
    )
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to delete comment!",
    })
  }
}
