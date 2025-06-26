from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError 
from django.utils import timezone 

User = get_user_model()

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='employee_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True, help_text="Název budovy nebo pracoviště")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
class EmployeeReport(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='reports')
    timestamp = models.DateTimeField(auto_now_add=True) 
    content = models.TextField(help_text="Obsah reportu")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Report for {self.employee.first_name} {self.employee.last_name} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
class AttendanceRecord(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    check_in_time = models.DateTimeField()
    check_out_time = models.DateTimeField(blank=True, null=True)

    date = models.DateField(editable=False)

    class Meta:
        ordering = ['-check_in_time']

    def save(self, *args, **kwargs):
        if self.check_in_time and not self.date:
            self.date = self.check_in_time.date()
        super().save(*args, **kwargs)

    def __str__(self):
        checkout_str = self.check_out_time.strftime('%H:%M') if self.check_out_time else 'Nezaznamenáno'
        return f"{self.employee.first_name} {self.employee.last_name} - {self.date.strftime('%Y-%m-%d')}: {self.check_in_time.strftime('%H:%M')} - {checkout_str}"
    
class Leave(models.Model):
    LEAVE_TYPE_CHOICES = [
        ('VACATION', 'Dovolená'),
        ('SICK', 'Nemocenská'),
        ('PERSONAL', 'Osobní volno'),
        ('OTHER', 'Jiné'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Čeká na schválení'),
        ('APPROVED', 'Schváleno'),
        ('REJECTED', 'Zamítnuto'),
        ('CANCELLED', 'Zrušeno'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leaves' 
    )
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    reason = models.TextField(blank=True, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.employee.first_name} {self.employee.last_name} - {self.leave_type} ({self.status})"

    def clean(self): 
        super().clean() 

        MAX_REASON_LENGTH = 500 
        if self.reason and len(self.reason) > MAX_REASON_LENGTH:
            raise ValidationError({'reason': f'Důvod je příliš dlouhý. Maximální délka je {MAX_REASON_LENGTH} znaků.'})

        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError({'end_date': 'Datum "Do" nemůže být před datem "Od".'})
            
            if self.start_date < timezone.now().date():
                 raise ValidationError({'start_date': 'Žádost o dovolenou nemůže začínat v minulosti.'})
                 

    def save(self, *args, **kwargs):
        self.full_clean() 
        super().save(*args, **kwargs)


class TransactionCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Název kategorie")
    description = models.TextField(blank=True, null=True, verbose_name="Popis kategorie")
    
    TYPE_CHOICES = [
        ('INCOME', 'Příjem'),
        ('EXPENSE', 'Výdaj'),
    ]
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, verbose_name="Typ (Příjem/Výdaj)")

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    class Meta:
        verbose_name = "Kategorie Transakce"
        verbose_name_plural = "Kategorie Transakcí"
        ordering = ['name']


class Transaction(models.Model):
    title = models.CharField(max_length=255, verbose_name="Název transakce")
    description = models.TextField(blank=True, null=True, verbose_name="Popis")
    amount = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Částka")
    
    category = models.ForeignKey(TransactionCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions', verbose_name="Kategorie")

    TRANSACTION_TYPES = [
        ('INCOME', 'Příjem'),
        ('EXPENSE', 'Výdaj'),
    ]
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, verbose_name="Typ transakce") # Příjem nebo výdaj

    PAYMENT_METHODS = [
        ('CASH', 'Hotovost'),
        ('BANK_TRANSFER', 'Bankovní převod'),
        ('CARD', 'Platební karta'),
        ('OTHER', 'Jiné'),
    ]
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='BANK_TRANSFER', verbose_name="Způsob platby")

    transaction_date = models.DateField(verbose_name="Datum transakce")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Vytvořeno")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Aktualizováno")

    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recorded_transactions', verbose_name="Zaznamenal(a)")

    party_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Strana transakce (Klient/Dodavatel)")

    def __str__(self):
        return f"{self.get_type_display()}: {self.title} - {self.amount} ({self.transaction_date})"

    class Meta:
        verbose_name = "Transakce"
        verbose_name_plural = "Transakce"
        ordering = ['-transaction_date', '-created_at']

class Document(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    employee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_documents')
    document_type = models.CharField(max_length=50, choices=[('contract', 'Contract'), ('policy', 'Policy'), ('training', 'Training Record')])
    is_public = models.BooleanField(default=False) 

    effective_date = models.DateField(null=True, blank=True, verbose_name="Datum platnosti od")
    contract_end_date = models.DateField(null=True,blank=True,verbose_name="Datum ukončení smlouvy")
    
    def __str__(self):
        return self.title
    
    @property
    def is_expiring_soon(self):
        if self.document_type == 'contract' and self.contract_end_date:
            from datetime import date, timedelta
            return self.contract_end_date <= date.today() + timedelta(days=30) and self.contract_end_date >= date.today()
        return False

    @property
    def has_expired(self):
        if self.document_type == 'contract' and self.contract_end_date:
            from datetime import date
            return self.contract_end_date < date.today()
        return False