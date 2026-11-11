#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* ---------- Student structure (linked-list node) ---------- */
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

struct Student *head = NULL;

/* ---------- Helpers ---------- */
struct Student *findStudent(int roll) {
    struct Student *temp = head;
    while (temp != NULL) {
        if (temp->roll == roll)
            return temp;
        temp = temp->next;
    }
    return NULL;
}

void clearInput(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

/* ---------- 1. Add Student ---------- */
/* ---------- 1. Add Student ---------- */
void addStudent(void) {
    struct Student *newNode =
        (struct Student *)malloc(sizeof(struct Student));

    if (newNode == NULL) {
        printf("Memory allocation failed!\n");
        return;
    }

    printf("Enter Roll No: ");
    scanf("%d", &newNode->roll);
    clearInput();

    if (findStudent(newNode->roll) != NULL) {
        printf("A student with this roll number already exists!\n");
        free(newNode);
        return;
    }

    printf("Enter Name: ");
    fgets(newNode->name, sizeof(newNode->name), stdin);
    newNode->name[strcspn(newNode->name, "\n")] = '\0';

    printf("Enter Email: ");
    fgets(newNode->email, sizeof(newNode->email), stdin);
    newNode->email[strcspn(newNode->email, "\n")] = '\0';

    printf("Enter Phone: ");
    fgets(newNode->phone, sizeof(newNode->phone), stdin);
    newNode->phone[strcspn(newNode->phone, "\n")] = '\0';

    printf("Enter Department: ");
    fgets(newNode->department, sizeof(newNode->department), stdin);
    newNode->department[strcspn(newNode->department, "\n")] = '\0';

    printf("Enter Year: ");
    fgets(newNode->year, sizeof(newNode->year), stdin);
    newNode->year[strcspn(newNode->year, "\n")] = '\0';

    printf("Enter Semester: ");
    fgets(newNode->semester, sizeof(newNode->semester), stdin);
    newNode->semester[strcspn(newNode->semester, "\n")] = '\0';

    printf("Enter Marks: ");
    scanf("%f", &newNode->marks);
    clearInput();

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

    printf("Student added successfully.\n");
}


/* ---------- 2. Display Students ---------- */
void displayStudents(void) {

    if (head == NULL) {
        printf("No records found.\n");
        return;
    }

    struct Student *temp = head;

    printf("\n========== STUDENT RECORDS ==========\n");

    while (temp != NULL) {

        printf("\nRoll No    : %d\n", temp->roll);
        printf("Name       : %s\n", temp->name);
        printf("Email      : %s\n", temp->email);
        printf("Phone      : %s\n", temp->phone);
        printf("Department : %s\n", temp->department);
        printf("Year       : %s\n", temp->year);
        printf("Semester   : %s\n", temp->semester);
        printf("Marks      : %.2f\n", temp->marks);

        printf("-------------------------------------\n");

        temp = temp->next;
    }
}

/* ---------- 3. Search Student ---------- */
void searchStudent(void) {

    int roll;

    printf("Enter Roll No to search: ");
    scanf("%d", &roll);
    clearInput();

    struct Student *s = findStudent(roll);

    if (s == NULL) {

        printf("Student not found.\n");

    } else {

        printf("\n========== STUDENT FOUND ==========\n");

        printf("Roll No    : %d\n", s->roll);
        printf("Name       : %s\n", s->name);
        printf("Email      : %s\n", s->email);
        printf("Phone      : %s\n", s->phone);
        printf("Department : %s\n", s->department);
        printf("Year       : %s\n", s->year);
        printf("Semester   : %s\n", s->semester);
        printf("Marks      : %.2f\n", s->marks);

        printf("-----------------------------------\n");
    }
}

/* ---------- 4. Update Student ---------- */
void updateStudent(void) {

    int roll;

    printf("Enter Roll No to update: ");
    scanf("%d", &roll);
    clearInput();

    struct Student *s = findStudent(roll);

    if (s == NULL) {
        printf("Student not found.\n");
        return;
    }

    printf("Enter new Name: ");
    fgets(s->name, sizeof(s->name), stdin);
    s->name[strcspn(s->name, "\n")] = '\0';

    printf("Enter new Email: ");
    fgets(s->email, sizeof(s->email), stdin);
    s->email[strcspn(s->email, "\n")] = '\0';

    printf("Enter new Phone: ");
    fgets(s->phone, sizeof(s->phone), stdin);
    s->phone[strcspn(s->phone, "\n")] = '\0';

    printf("Enter new Department: ");
    fgets(s->department, sizeof(s->department), stdin);
    s->department[strcspn(s->department, "\n")] = '\0';

    printf("Enter new Year: ");
    fgets(s->year, sizeof(s->year), stdin);
    s->year[strcspn(s->year, "\n")] = '\0';

    printf("Enter new Semester: ");
    fgets(s->semester, sizeof(s->semester), stdin);
    s->semester[strcspn(s->semester, "\n")] = '\0';

    printf("Enter new Marks: ");
    scanf("%f", &s->marks);
    clearInput();

    printf("Record updated successfully.\n");
}

/* ---------- 5. Delete Student ---------- */
void deleteStudent(void) {
    int roll;
    printf("Enter Roll No to delete: ");
    scanf("%d", &roll);
    clearInput();

    if (head == NULL) {
        printf("No records to delete.\n");
        return;
    }

    struct Student *temp = head, *prev = NULL;

    /* Deleting the first node */
    if (head->roll == roll) {
        head = head->next;
        free(temp);
        printf("Record deleted successfully.\n");
        return;
    }

    while (temp != NULL && temp->roll != roll) {
        prev = temp;
        temp = temp->next;
    }

    if (temp == NULL) {
        printf("Student not found.\n");
        return;
    }

    prev->next = temp->next;
    free(temp);
    printf("Record deleted successfully.\n");
}

/* ---------- Free all memory on exit ---------- */
void freeList(void) {
    struct Student *temp;
    while (head != NULL) {
        temp = head;
        head = head->next;
        free(temp);
    }
}

/* ---------- main: menu ---------- */
int main(void) {
    int choice;

    do {
        printf("\n===== Student Record Management =====\n");
        printf("1. Add Student\n");
        printf("2. Display Students\n");
        printf("3. Search Student\n");
        printf("4. Update Student\n");
        printf("5. Delete Student\n");
        printf("6. Exit\n");
        printf("Enter your choice: ");

        if (scanf("%d", &choice) != 1) {
            clearInput();
            choice = 0;
        } else {
            clearInput();
        }

        switch (choice) {
            case 1: addStudent();      break;
            case 2: displayStudents(); break;
            case 3: searchStudent();   break;
            case 4: updateStudent();   break;
            case 5: deleteStudent();   break;
            case 6: printf("Exiting program. Goodbye!\n"); break;
            default: printf("Invalid choice! Try again.\n");
        }
    } while (choice != 6);

    freeList();
    return 0;
}
