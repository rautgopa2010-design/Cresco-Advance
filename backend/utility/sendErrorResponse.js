exports.sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ errors: [{ msg: message }] });
};
