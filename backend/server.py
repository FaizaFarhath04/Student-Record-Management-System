from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
from dotenv import load_dotenv
import ctypes
import os
import psycopg

app = Flask(__name__)
CORS(app)

# Load environment variables from the main project folder
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from .env")


# Connect to Neon PostgreSQL
def get_db_connection():
    return psycopg.connect(DATABASE_URL)


# Load the C linked-list DLL
import platform

library_name = "student_api.dll" if platform.system() == "Windows" else "libstudent_api.so"
dll_path = Path(__file__).with_name(library_name)
c_backend = ctypes.CDLL(str(dll_path)))


# Define the C Student structure
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


# Configure C functions
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

c_backend.freeList.argtypes = []
c_backend.freeList.restype = None


# Refresh the C linked list using records stored in Neon
def refresh_linked_list():
    with get_db_connection() as conn:
        records = conn.execute("""
            SELECT roll, name, email, phone, department,
                   year, semester, marks
            FROM students
            ORDER BY roll
        """).fetchall()

    c_backend.freeList()

    for row in records:
        c_backend.addStudent(
            row[0],
            row[1].encode("utf-8"),
            (row[2] or "").encode("utf-8"),
            (row[3] or "").encode("utf-8"),
            (row[4] or "").encode("utf-8"),
            (row[5] or "").encode("utf-8"),
            (row[6] or "").encode("utf-8"),
            float(row[7] or 0)
        )


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
    return "Student Record Management System - Neon PostgreSQL Connected!"


# Display all students
@app.route("/students", methods=["GET"])
def get_students():
    try:
        refresh_linked_list()

        students = []
        current = c_backend.getStudents()

        while bool(current):
            students.append(get_student_data(current.contents))
            current = current.contents.next

        return jsonify(students)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Add a student
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
        with get_db_connection() as conn:
            conn.execute("""
                INSERT INTO students
                (roll, name, email, phone, department,
                 year, semester, marks)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                int(data["roll"]),
                str(data["name"]),
                str(data["email"]),
                str(data["phone"]),
                str(data["department"]),
                str(data["year"]),
                str(data["semester"]),
                float(data["marks"])
            ))

        refresh_linked_list()
        return jsonify({"message": "Student added successfully"}), 201

    except psycopg.errors.UniqueViolation:
        return jsonify({"error": "Roll number already exists"}), 409

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid student details"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update a student
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
        with get_db_connection() as conn:
            result = conn.execute("""
                UPDATE students
                SET name = %s,
                    email = %s,
                    phone = %s,
                    department = %s,
                    year = %s,
                    semester = %s,
                    marks = %s
                WHERE roll = %s
                RETURNING roll
            """, (
                str(data["name"]),
                str(data["email"]),
                str(data["phone"]),
                str(data["department"]),
                str(data["year"]),
                str(data["semester"]),
                float(data["marks"]),
                roll
            ))

            if result.fetchone() is None:
                return jsonify({"error": "Student not found"}), 404

        refresh_linked_list()
        return jsonify({"message": "Student updated successfully"})

    except (ValueError, TypeError):
        return jsonify({"error": "Invalid student details"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete a student
@app.route("/students/<int:roll>", methods=["DELETE"])
def delete_student(roll):
    try:
        with get_db_connection() as conn:
            result = conn.execute("""
                DELETE FROM students
                WHERE roll = %s
                RETURNING roll
            """, (roll,))

            if result.fetchone() is None:
                return jsonify({"error": "Student not found"}), 404

        refresh_linked_list()
        return jsonify({"message": "Student deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)