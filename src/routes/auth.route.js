const express = require("express");
const router = express.Router();
const { register, login, logout , getAllUsers} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", getAllUsers);

module.exports = router;

