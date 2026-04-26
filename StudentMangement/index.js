const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const students = [
  { id: 1, name: "Ali", age: 20 },
  { id: 2, name: "Sara", age: 22 },
];

const courses = [{ id: 1, title: "Mathematics" }, { id: 2, title: "Physics" }];

const isValidStudentPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (typeof payload.name !== "string" || payload.name.trim().length === 0) {
    return false;
  }

  if (!Number.isInteger(payload.age) || payload.age <= 0) {
    return false;
  }

  return true;
};

const toStudentResponse = (req, student) => ({
  ...student,
  links: {
    self: `${req.protocol}://${req.get("host")}/students/${student.id}`,
    allStudents: `${req.protocol}://${req.get("host")}/students`,
  },
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Student Management API",
    links: {
      students: `${req.protocol}://${req.get("host")}/students`,
      courses: `${req.protocol}://${req.get("host")}/courses`,
    },
  });
});

app.get("/students", (req, res) => {
  res.status(200).json({
    data: students.map((student) => toStudentResponse(req, student)),
  });
});

app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((item) => item.id === id);

  if (!student) {
    return res.status(404).json({
      error: "Student not found",
    });
  }

  return res.status(200).json({
    data: toStudentResponse(req, student),
  });
});

app.post("/students", (req, res) => {
  if (!isValidStudentPayload(req.body)) {
    return res.status(400).json({
      error: "Invalid student payload. Expected { name: string, age: positive integer }",
    });
  }

  const nextId = students.length === 0 ? 1 : Math.max(...students.map((item) => item.id)) + 1;
  const newStudent = {
    id: nextId,
    name: req.body.name.trim(),
    age: req.body.age,
  };

  students.push(newStudent);

  return res.status(201).json({
    data: toStudentResponse(req, newStudent),
  });
});

app.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const studentIndex = students.findIndex((item) => item.id === id);

  if (studentIndex === -1) {
    return res.status(404).json({
      error: "Student not found",
    });
  }

  if (!isValidStudentPayload(req.body)) {
    return res.status(400).json({
      error: "Invalid student payload. Expected { name: string, age: positive integer }",
    });
  }

  students[studentIndex] = {
    id,
    name: req.body.name.trim(),
    age: req.body.age,
  };

  return res.status(200).json({
    data: toStudentResponse(req, students[studentIndex]),
  });
});

app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const studentIndex = students.findIndex((item) => item.id === id);

  if (studentIndex === -1) {
    return res.status(404).json({
      error: "Student not found",
    });
  }

  const [deletedStudent] = students.splice(studentIndex, 1);

  return res.status(200).json({
    data: deletedStudent,
    message: "Student deleted successfully",
  });
});

app.get("/courses", (req, res) => {
  res.status(200).json({
    data: courses,
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
