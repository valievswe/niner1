const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Handle specific Prisma errors
  if (err.code === "P2002") {
    statusCode = 409; // Conflict
    message = `A record with this value already exists. (Fields: ${err.meta?.target?.join(
      ", "
    )})`;
  } else if (err.code === "P2025") {
    statusCode = 404; // Not Found
    message = err.meta?.cause || "The requested record was not found.";
  } else if (err.code === "P2003") {
    statusCode = 400; // Bad Request
    message = `Invalid input: The provided ID for the field '${err.meta?.field_name}' does not exist.`;
  }

  // Log the full error for server-side debugging, especially for 500 errors
  if (statusCode === 500) {
    console.error("Internal Server Error:", err.stack);
    // For security, don't leak implementation details of 500 errors to the client
    message = "An internal server error occurred.";
  }

  res.status(statusCode).json({
    error: {
      message: message,
    },
  });
};

module.exports = errorHandler;
