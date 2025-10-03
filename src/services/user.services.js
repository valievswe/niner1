// src/services/user.services.js

const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

class UserService {
  /**
   * Creates a new user (called by an admin).
   * @param {Object} userData - { email, password, firstName, lastName, role }
   * @returns {Promise<Object>} The newly created user (without password).
   */
  async createUserByAdmin(userData) {
    const { email, password, firstName, lastName, role } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error("A user with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "STUDENT",
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Retrieves a list of all users.
   * @returns {Promise<Array>} A list of users.
   */
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Retrieves a single user by their ID.
   * @param {String} id - The ID of the user.
   * @returns {Promise<Object|null>} The user object or null if not found.
   */
  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Updates a user's information.
   * @param {String} userId - The ID of the user to update.
   * @param {Object} updateData - The data to update.
   * @returns {Promise<Object>} The updated user (without password).
   */
  async updateUser(userId, updateData) {
    // Exclude email and password from the direct update payload for security
    const { email, password, ...dataToUpdate } = updateData;

    // A more advanced implementation could allow password changes, but we'll keep it simple
    // if (password) {
    //   dataToUpdate.password = await bcrypt.hash(password, 10);
    // }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Deletes a user by their ID.
   * @param {String} userId - The ID of the user to delete.
   */
  async deleteUser(userId) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}

module.exports = new UserService();
