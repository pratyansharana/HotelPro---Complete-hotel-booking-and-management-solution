const app = require("./app");
const connectDB = require("./config");

async function startServer() {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith("replace-with-")
  ) {
    throw new Error(
      "Set JWT_SECRET in Server/.env to a random value at least 32 characters long.",
    );
  }

  await connectDB();

  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
