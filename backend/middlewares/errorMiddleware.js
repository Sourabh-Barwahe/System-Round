export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  return res
    .status(500)
    .json({ success: false, message: "Internal Server Error" });
};
