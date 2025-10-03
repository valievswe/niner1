// src/controllers/user.controller.js

const userService = require("../services/user.services");

class UserController {
  /**
   * Handles admin request to create a new user.
   */
  async create(req, res) {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error:
          "All fields (email, password, firstName, lastName) are required.",
      });
    }
    const newUser = await userService.createUserByAdmin(req.body);
    res.status(201).json(newUser);
  }

  /**
   * Handles admin request to get all users.
   */
  async getAll(req, res) {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  }

  /**
   * Handles admin request to get a single user by ID.
   */
  async getById(req, res) {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(user);
  }

  /**
   * Handles admin request to update a user.
   */
  async update(req, res) {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  }

  /**
   * Handles admin request to delete a user.
   */
  async remove(req, res) {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  }
}

module.exports = new UserController();
