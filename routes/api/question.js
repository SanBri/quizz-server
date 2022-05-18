import express from "express";
import { check, validationResult } from "express-validator";
import auth from "../../middleware/auth.js";

import Question from "../../models/Question.js";
import Category from "../../models/Category.js";

const router = express.Router();

// @route  GET api/question/:category/:number
// @desc   Get (X or All) Questions (By Category or All)
// @access Public
router.get("/:category/:number", async (req, res) => {
  let query = [];
  req.params.number !== "undefined"
    ? (query = [{ $sample: { size: parseInt(req.params.number) } }]) // Choisir aléatoirement X question
    : "";
  req.params.category !== "undefined"
    ? query.push({ $match: { category: req.params.category } })
    : ""; // Si on cherche une catégorie spécifique, ajouter ce paramètre à la requête
  try {
    const questions = await Question.aggregate(query);
    if (!questions) {
      res.status(404).send("Il n'y a aucune question");
    }
    res.status(200).send(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/question/
// @desc    ADD Question
// @access  Private
router.post(
  "/",
  auth,
  [
    check("question", "Veuillez entrer une question").not().isEmpty(),
    check("answer", "Veuillez entrer une réponse").not().isEmpty(),
    check("category", "Veuillez entrer une catégorie").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { question, answer, category, image } = req.body;
    const questionFields = {};
    questionFields.question = question;
    questionFields.answer = answer.toUpperCase();
    questionFields.category = category;
    questionFields.image = image;
    try {
      const newQuestion = new Question(questionFields);
      const currentCategory = await Category.findOne({ name: category });
      if (!currentCategory) {
        const categoryFields = {};
        categoryFields.name = category;
        const newCategoy = new Category(categoryFields);
        await newCategoy.save();
      }
      await newQuestion.save();
      res.json(newQuestion);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/question/
// @desc    Edit Question Point
// @access  Private
router.put(
  "/:id",
  auth,
  [
    check("question", "Veuillez entrer une question").not().isEmpty(),
    check("answer", "Veuillez entrer une réponse").not().isEmpty(),
    check("category", "Veuillez entrer une catégorie").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { question, answer, category, image, points } = req.body;
    const questionFields = {};
    questionFields.question = question;
    questionFields.answer = answer;
    questionFields.category = category;
    questionFields.image = image;
    questionFields.points = points;
    if (question) questionFields.question = question;
    if (answer) questionFields.answer = answer;
    if (category) questionFields.category = category;
    if (image) questionFields.image = image;
    if (points) questionFields.points = points;
    try {
      const question = await Question.findOneAndUpdate(
        { _id: req.params.id },
        { $set: questionFields },
        { new: true }
      );
      if (!question) {
        return res.status(404).json({
          errors: [{ msg: "Question introuvable" }],
        });
      }
      await question.save();
      return res.status(200).json(question);
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "Question introuvable" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE api/question/
// @desc    Delete a Question
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        errors: [{ msg: "Question introuvable" }],
      });
    }
    await question.remove();
    res.json("Question supprimée");
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({
        errors: [{ msg: "Question introuvable" }],
      });
    }
    res.status(500).send("Server Error");
  }
});

export default router;
