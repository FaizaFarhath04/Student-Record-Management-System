#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Student structure using Linked List */
struct Student {
    int roll;
    char name[50];
    char email[100];
    char phone[20];
    char department[50];
    char year[20];
    char semester[20];
    float marks;
    struct Student *next;
};

/* Head pointer */
struct Student *head = NULL;

struct Student *findStudent(int roll) {
    struct Student *temp = head;

    while (temp != NULL) {
        if (temp->roll == roll) {
            return temp;
        }
        temp = temp->next;
    }

    return NULL;
}

void addStudent(int roll, char *name, char *email,
                char *phone, char *department,
                char *year, char *semester, float marks) {

    if (findStudent(roll) != NULL) {
        return;
    }

    struct Student *newNode =
        (struct Student *)malloc(sizeof(struct Student));

    if (newNode == NULL) {
        return;
    }

    newNode->roll = roll;

    snprintf(newNode->name, sizeof(newNode->name), "%s", name);
snprintf(newNode->email, sizeof(newNode->email), "%s", email);
snprintf(newNode->phone, sizeof(newNode->phone), "%s", phone);
snprintf(newNode->department, sizeof(newNode->department), "%s", department);
snprintf(newNode->year, sizeof(newNode->year), "%s", year);
snprintf(newNode->semester, sizeof(newNode->semester), "%s", semester);

    newNode->marks = marks;
    newNode->next = NULL;

    if (head == NULL) {
        head = newNode;
    } else {
        struct Student *temp = head;

        while (temp->next != NULL) {
            temp = temp->next;
        }

        temp->next = newNode;
    }
}

struct Student *getStudents(void) {
    return head;
}

int deleteStudent(int roll) {
    struct Student *temp = head;
    struct Student *prev = NULL;

    while (temp != NULL && temp->roll != roll) {
        prev = temp;
        temp = temp->next;
    }

    if (temp == NULL) {
        return 0;
    }

    if (prev == NULL) {
        head = temp->next;
    } else {
        prev->next = temp->next;
    }

    free(temp);
    return 1;
}

int updateStudent(int roll, char *name, char *email,
                  char *phone, char *department,
                  char *year, char *semester, float marks) {

    struct Student *s = findStudent(roll);

    if (s == NULL) {
        return 0;
    }

    snprintf(s->name, sizeof(s->name), "%s", name);
    snprintf(s->email, sizeof(s->email), "%s", email);
    snprintf(s->phone, sizeof(s->phone), "%s", phone);
    snprintf(s->department, sizeof(s->department), "%s", department);
    snprintf(s->year, sizeof(s->year), "%s", year);
    snprintf(s->semester, sizeof(s->semester), "%s", semester);

    s->marks = marks;

    return 1;
}

void freeList(void) {
    struct Student *temp;

    while (head != NULL) {
        temp = head;
        head = head->next;
        free(temp);
    }
}

// ========================================
// PERMANENT FILE STORAGE
// ========================================

struct StudentData {
    int roll;
    char name[50];
    char email[100];
    char phone[20];
    char department[50];
    char year[20];
    char semester[20];
    float marks;
};


// Save student records to a file
int saveStudentsToFile(char *filename) {

    FILE *file = fopen(filename, "wb");

    if (file == NULL) {
        return 0;
    }

    struct Student *temp = head;

    while (temp != NULL) {

        struct StudentData data;

        data.roll = temp->roll;

        strcpy(data.name, temp->name);
        strcpy(data.email, temp->email);
        strcpy(data.phone, temp->phone);
        strcpy(data.department, temp->department);
        strcpy(data.year, temp->year);
        strcpy(data.semester, temp->semester);

        data.marks = temp->marks;

        fwrite(&data, sizeof(struct StudentData), 1, file);

        temp = temp->next;
    }

    fclose(file);

    return 1;
}


// Load student records from a file
int loadStudentsFromFile(char *filename) {

    FILE *file = fopen(filename, "rb");

    if (file == NULL) {
        return 0;
    }

    freeList();

    struct StudentData data;

    while (fread(&data, sizeof(struct StudentData), 1, file) == 1) {

        addStudent(
            data.roll,
            data.name,
            data.email,
            data.phone,
            data.department,
            data.year,
            data.semester,
            data.marks
        );
    }

    fclose(file);

    return 1;
}