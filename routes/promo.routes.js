const express = require("express");
const router = express.Router();
const pool = require("../database/coffeeshop.db");
const jwtAuthorize = require("../middleware/jwt.validator");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../kape-main/src/assets/promos"); // Specify where to store the images
    },
    filename: (req, file, cb) => {
        // Make sure the filename is unique by appending the timestamp
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Create multer instance to handle single image upload
const upload = multer({ storage: storage });

// Route to upload a promotion
router.post(
    "/upload-promo",
    jwtAuthorize,
    upload.single("promoImage"),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const { promoTitle, promoDescription } = req.body;
        const promoImage = req.file.path; // Get the image path

        console.log(promoTitle);
        if (!promoTitle || !promoDescription) {
            return res.status(400).json({
                error: "Promotion title and description are required",
            });
        }

        try {
            // Insert the promotion data into the database (adjust the table name and columns as needed)
            const result = await pool.query(
                "INSERT INTO promotions (promo_title, promo_description, promo_image) VALUES ($1, $2, $3) RETURNING *",
                [promoTitle, promoDescription, promoImage]
            );

            // Respond with the inserted data
            res.status(201).json({
                message: "Promotion uploaded successfully",
                promotion: result.rows[0],
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to upload promotion" });
        }
    }
);

// Route to get all promotions
router.get("/get-promos", async (req, res) => {
    try {
        // Query to fetch all promotions from the database
        const result = await pool.query("SELECT * FROM promotions");

        // Respond with the promotions data
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch promotions" });
    }
});

module.exports = router;
