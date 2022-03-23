const notesRouter = require("express").Router();
const Note = require("../models/mongo");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

notesRouter.get("/", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

notesRouter.get("/:id", (req, res, next) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    return authorization.substring(7);
  }
  return null;
};

notesRouter.post("/", async (req, res) => {
  const body = req.body;
  const token = getTokenFrom(req);

  const decodedToken = jwt.verify(token, process.env.SECRET);

  if (!decodedToken) {
    return res.status(401).json({
      error: "Token missing or invalid",
    });
  }

  const user = await User.findById(body.userId);
  const newNote = new Note({
    content: body.content,
    important: body.important,
    date: new Date(),
    user: user._id,
  });

  const savedNote = await newNote.save();
  user.notes = user.notes.concat(savedNote._id);

  await user.save();
  res.status(201).json(savedNote);
});

notesRouter.delete("/:id", (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => {
      res.json(204).end();
    })
    .catch((error) => next(error));
});

notesRouter.put(":/id", (req, res, next) => {
  const body = req.body;

  const note = {
    content: body.content,
    important: body.important,
  };

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then((updatedNote) => {
      res.json(updatedNote);
    })
    .catch(next(error));
});

module.exports = notesRouter;
