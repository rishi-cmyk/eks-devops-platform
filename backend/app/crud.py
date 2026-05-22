from sqlalchemy.orm import Session
from app import models, schemas

def create_employee(db: Session, employee: schemas.EmployeeCreate):

    db_employee = models.Employee(
        name=employee.name,
        department=employee.department,
        email=employee.email
    )

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    return db_employee


def get_employees(db: Session):
    return db.query(models.Employee).all()


def update_employee(
    db: Session,
    employee_id: int,
    employee: schemas.EmployeeCreate
):

    db_employee = (
        db.query(models.Employee)
        .filter(models.Employee.id == employee_id)
        .first()
    )

    if not db_employee:
        return None

    db_employee.name = employee.name
    db_employee.department = employee.department
    db_employee.email = employee.email

    db.commit()
    db.refresh(db_employee)

    return db_employee


def delete_employee(db: Session, employee_id: int):

    db_employee = (
        db.query(models.Employee)
        .filter(models.Employee.id == employee_id)
        .first()
    )

    if not db_employee:
        return None

    db.delete(db_employee)
    db.commit()

    return db_employee
