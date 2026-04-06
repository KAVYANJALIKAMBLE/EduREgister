const express = require("express");
const router = express.Router();
const db = require("../db");

// ADD STUDENT
router.post("/add", (req, res) => {
  const { name, className, division } = req.body;

  const sql = "INSERT INTO students (name_en, class, division) VALUES (?, ?, ?)";
  db.query(sql, [name, className, division], (err, result) => {
    if (err) return res.send(err);
    res.send("Student Added");
  });
});

// GET ALL STUDENTS
router.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// DELETE STUDENT
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM students WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.send(err);
    res.send("Deleted");
  });
});

module.exports = router;
