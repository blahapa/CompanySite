from django.contrib import admin
from .models import Department, Employee, AttendanceRecord, EmployeeReport, Leave, TransactionCategory, Transaction


for model in (Department, Employee, AttendanceRecord, EmployeeReport, Leave, TransactionCategory, Transaction):
    admin.site.register(model)
