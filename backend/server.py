from flask import Flask, request, jsonify
from flask_cors import CORS
import ctypes
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Load the C backend DLL
dll_path = Path(__file__).with_name("student_api.dll")
c_backend = ctypes.CDLL(str(dll_path))


# Define the Student structure in Python
class Student(ctypes.Structure):
    pass


StudentPointer = ctypes.POINTER(Student)

Student._fields_ = [
    ("roll", ctypes.c_int),
    ("name", ctypes.c_char * 50),
    ("email", ctypes.c_char * 100),
    ("phone", ctypes.c_char * 20),
    ("department", ctypes.c_char * 50),
    ("year", ctypes.c_char * 20),
    ("semester", ctypes.c_char * 20),
    ("marks", ctypes.c_float),
    ("next", StudentPointer)
]


# Connect C functions
c_backend.addStudent.argtypes = [
    ctypes.c_int,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_float
]

c_backend.getStudents.restype = StudentPointer

c_backend.deleteStudent.argtypes = [ctypes.c_int]
c_backend.deleteStudent.restype = ctypes.c_int

c_backend.updateStudent.argtypes = [
    ctypes.c_int,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_char_p,
    ctypes.c_float
]

c_backend.updateStudent.restype = ctypes.c_int


# Connect permanent storage functions
c_backend.saveStudentsToFile.argtypes = [ctypes.c_char_p]
c_backend.saveStudentsToFile.restype = ctypes.c_int

c_backend.loadStudentsFromFile.argtypes = [ctypes.c_char_p]
c_backend.loadStudentsFromFile.restype = ctypes.c_int


# Location of the permanent student records file
DATA_FILE = str(
    Path(__file__).with_name("students.dat")
).encode("utf-8")


# Load previously saved records when the server starts
c_backend.loadStudentsFromFile(DATA_FILE)
def get_student_data(student):
    return {
        "roll": student.roll,
        "name": student.name.decode("utf-8"),
        "email": student.email.decode("utf-8"),
        "phone": student.phone.decode("utf-8"),
        "department": student.department.decode("utf-8"),
        "year": student.year.decode("utf-8"),
        "semester": student.semester.decode("utf-8"),
        "marks": student.marks
    }


@app.route("/")
def home():
    return "Student Record Management System - C Backend Connected!"


@app.route("/students", methods=["GET"])
def get_students():
    students = []
    current = c_backend.getStudents()

    while bool(current):
        students.append(get_student_data(current.contents))
        current = current.contents.next

    return jsonify(students)


@app.route("/students", methods=["POST"])
def add_student():
    data = request.get_json()

    required = [
        "roll", "name", "email", "phone",
        "department", "year", "semester", "marks"
    ]

    if not data or any(key not in data for key in required):
        return jsonify({"error": "Missing student details"}), 400

    try:
        c_backend.addStudent(
            int(data["roll"]),
            str(data["name"]).encode("utf-8"),
            str(data["email"]).encode("utf-8"),
            str(data["phone"]).encode("utf-8"),
            str(data["department"]).encode("utf-8"),
            str(data["year"]).encode("utf-8"),
            str(data["semester"]).encode("utf-8"),
            float(data["marks"])
        )
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid student details"}), 400

    if not c_backend.saveStudentsToFile(DATA_FILE):
        return jsonify({"error": "Unable to save student records"}), 500

    return jsonify({"message": "Student added"}), 201

@app.route("/students/<int:roll>", methods=["DELETE"])
def delete_student(roll):
    result = c_backend.deleteStudent(roll)

    if result:
        if not c_backend.saveStudentsToFile(DATA_FILE):
            return jsonify({"error": "Unable to save student records"}), 500
        return jsonify({"message": "Student deleted"})

    return jsonify({"error": "Student not found"}), 404


@app.route("/students/<int:roll>", methods=["PUT"])
def update_student(roll):
    data = request.get_json()

    required = [
        "name", "email", "phone", "department",
        "year", "semester", "marks"
    ]

    if not data or any(key not in data for key in required):
        return jsonify({"error": "Missing student details"}), 400

    try:
        result = c_backend.updateStudent(
            roll,
            str(data["name"]).encode("utf-8"),
            str(data["email"]).encode("utf-8"),
            str(data["phone"]).encode("utf-8"),
            str(data["department"]).encode("utf-8"),
            str(data["year"]).encode("utf-8"),
            str(data["semester"]).encode("utf-8"),
            float(data["marks"])
        )
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid student details"}), 400

    if result:
        if not c_backend.saveStudentsToFile(DATA_FILE):
            return jsonify({"error": "Unable to save student records"}), 500

        return jsonify({"message": "Student updated"})

    return jsonify({"error": "Student not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)