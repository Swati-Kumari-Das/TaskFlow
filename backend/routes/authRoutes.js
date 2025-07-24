const express = require("express");
const {registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
}=require("../controllers/authController")
const {protect} =require("../middlewares/authMiddleware");
const upload=require("../middlewares/uploadMiddleware");
const router = express.Router();

// Auth Routes
router.post("/register",registerUser);      // Register User
router.post("/login", loginUser);           // Login User
router.get("/profile", protect, getUserProfile);    // Get User Profile
router.put("/profile", protect, updateUserProfile); // Update Profile


// router.post("/upload-image", upload.single("image"), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//     }
//     //const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
//       const imageUrl = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;
//     res.status(200).json({ imageUrl });
// });


// router.post("/upload-image", upload.single("image"), (req, res) => {
//   if (!req.file || !req.file.path) {
//     return res.status(400).json({ message: "Image upload failed" });
//   }

//   const imageUrl = req.file.path; // This is the public Cloudinary URL
//   res.status(200).json({ imageUrl });
// });


// controllers/imageController.js or similar
// Image upload route
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'Image upload failed' });
  }

  // ✅ Cloudinary URL already available in req.file.path
  return res.status(200).json({ imageUrl: req.file.path });
});

module.exports = router;


module.exports = router;