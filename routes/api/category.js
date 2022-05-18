import express from "express";

import Category from "../../models/Category.js";

const router = express.Router();

// @route  GET api/category
// @desc   Get All Categories
// @access Public
router.get("/", async (_, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 }) // Résultats classés par ordre alphabétique
      .collation({ locale: "fr" }); // Prendre en compte les caractères français
    if (!categories) {
      res.status(404).send("Il n'y a aucune catégorie");
    }
    res.status(200).send(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
