const config = require("./utils/config");
const express = require("express");
const app = express();
const cors = require("cors");
const logger = require("./utils/logger");

const notesRouter = require("./controllers/notes");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

const middlewares = require("./utils/middlewares");
const mongoose = require("mongoose");

logger.info(`Connecting to ${config.MONGODB_URI}`);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error(`error connecting to MongoDB: ${error.message}`);
  });

app.use(express.json());
app.use(express.static("build"));

app.use(cors());
app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(middlewares.requestLogger);
app.use(middlewares.unknownEndpoint);
app.use(middlewares.errorHandler);
module.exports = app;
