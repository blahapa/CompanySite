from django.contrib import admin
from .models import Department, Employee, PerformanceReview, AttendanceRecord, Document, EmployeeReport, Leave, TransactionCategory, Transaction


for model in (Department, Employee, AttendanceRecord, PerformanceReview, Document, EmployeeReport, Leave, TransactionCategory, Transaction):
    admin.site.register(model)
