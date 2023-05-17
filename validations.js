import { body } from "express-validator"

// validation of registration data
export const registerValidation = [
  body("email", "Invalid mail format").isEmail(),
  body("password", "The password must be at least 6 characters long").isLength({
    min: 6,
  }),
  body("fullName", "Enter a name (minimum 3 characters)").isLength({ min: 3 }),
  body("avatarUrl", "Invalid link").optional().isURL(),
]

// validation of lolginization data
export const loginValidation = [
  body("email", "Invalid mail format").isEmail(),
  body("password", "The password must be at least 6 characters long").isLength({
    min: 6,
  }),
]

// data validation of the new post
export const postCreateValidation = [
  body("title", "Enter a post title").isLength({ min: 3, max: 100 }).isString(),
  body("text", "Enter the post test").isLength({ min: 3 }).isString(),
  body("tags", "invalid tag format ").optional().isString(),
  body("imageUrl", "Invalid image link").optional().isString(),
]

// validating a new comment
export const commentCreateValidation = [
  body("text", "Enter the text of the post").isLength({ min: 1 }).isString(),
]
