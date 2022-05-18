import express from "express";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import mongoose from "mongoose";

import auth from "../../middleware/auth.js";
import User from "../../models/User.js";

const router = express.Router();

// @route  POST api/users
// @desc   Register user
// @access Public
router.post(
  "/",
  [
    check("name", "Veuillez entrer un nom d'utilisateur").not().isEmpty(),
    check("mail", "Veuillez renseigner une adresse mail valide").isEmail(),
    check(
      "password",
      "Le mot de passe doit contenir au moins 8 caractères"
    ).isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, mail, password } = req.body;
    try {
      // Check if mail already used
      let user = await User.findOne({ mail });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Cette adresse mail est déjà utilisée" }] });
      }

      // Create new Object
      user = new User({ name, mail, password });

      // Password Crypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      const payload = {
        user: { id: user.id },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

export default router;
