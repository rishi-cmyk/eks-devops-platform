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
