const authService = require("../services/auth.services");
const userService = require("../services/user.services");

class AuthController {
  async register(req, res) {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newUser = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json(newUser);
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const { user, token } = await authService.loginUser({ email, password });

    res.status(200).json({ user, token });
  }

  async getMe(req, res) {
    const userId = req.user.userId;

    const freshUserData = await userService.findUserById(userId);

    if (!freshUserData) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(freshUserData);
  }
}

module.exports = new AuthController();
