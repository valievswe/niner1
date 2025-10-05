const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.code === "P2002") {
    statusCode = 409;
    message = `A record with this value already exists. (Fields: ${err.meta?.target?.join(
      ", "
    )})`;
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = err.meta?.cause || "The requested record was not found.";
  } else if (err.code === "P2003") {
    statusCode = 400;
    message =
      "Cannot delete this question because it is still in use by exams or has student responses.";
    console.warn("Prisma P2003 FK violation on DELETE:", err.meta);
  }

  if (statusCode === 500) {
    console.error("Internal Server Error:", err.stack);
    message = "An internal server error occurred.";
  }

  res.status(statusCode).json({
    error: {
      message: message,
    },
  });
};

module.exports = errorHandler;
