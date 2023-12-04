const path = require("path");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../../models/userModel");
const { upload } = require("../../app");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/register", async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email in use" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = await User.create({
      email: req.body.email,
      password: hashedPassword,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

router.post("/login", async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ userId: existingUser._id }, "user-password-hw04", {
      expiresIn: "1h",
    });

    existingUser.token = token;
    await existingUser.save();

    res.status(200).json({
      token,
      user: {
        email: existingUser.email,
        subscription: existingUser.subscription,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/current", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  router.patch("/avatars", upload.single("avatar"), async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const jimp = require("jimp");
      const uniqueFilename = `${user._id}-${Date.now()}${path.extname(
        req.file.originalname
      )}`;
      const avatarPath = `public/avatars/${uniqueFilename}`;

      await jimp.read(req.file.path).then((image) => {
        return image.resize(250, 250).quality(60).write(avatarPath);
      });

      user.avatarURL = `/avatars/${uniqueFilename}`;
      await user.save();

      res.status(200).json({
        avatarURL: user.avatarURL,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;
});
