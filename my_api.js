const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("./db");

const app = express();
app.use(express.json());


const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
};


app.get("/users", (req, res) => {
    db.query("SELECT * FROM students", (err, results) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.status(200).json(results);
    });
});


app.get("/users/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM students WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });
        res.status(200).json(results[0]);
    });
});


app.post(
    "/users",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("age").isInt({ min: 1 }).withMessage("Age must be a positive number"),
    ],
    (req, res) => {
        const errorResponse = handleValidation(req, res);
        if (errorResponse) return errorResponse;

        const { name, email, age } = req.body;
        const sql = "INSERT INTO students (name, age, email) VALUES (?, ?, ?)";
        db.query(sql, [name, age, email], (err, result) => {
            if (err) return res.status(500).json({ error: err.sqlMessage });
            res.status(201).json({ message: "User created", userId: result.insertId });
        });
    }
);


app.put(
    "/users/:id",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("age").isInt({ min: 1 }).withMessage("Age must be a positive number"),
    ],
    (req, res) => {
        const errorResponse = handleValidation(req, res);
        if (errorResponse) return errorResponse;

        const { id } = req.params;
        const { name, email, age } = req.body;
        const sql = "UPDATE students SET name=?, email=?, age=? WHERE id=?";
        db.query(sql, [name, email, age, id], (err, result) => {
            if (err) return res.status(500).json({ error: err.sqlMessage });
            if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
            res.status(200).json({ message: "User updated" });
        });
    }
);


app.patch("/users/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
    }

    const fields = Object.keys(updates).map((key) => `${key}=?`).join(", ");
    const values = Object.values(updates);

    const sql = `UPDATE students SET ${fields} WHERE id=?`;
    db.query(sql, [...values, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User patched" });
    });
});


app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM students WHERE id=?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted" });
    });
});


app.listen(5421, () => {
    console.log("🚀 Server running on http://localhost:5421");
});
