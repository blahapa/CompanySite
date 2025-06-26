from rest_framework import serializers
from .models import Employee, Department, EmployeeReport, AttendanceRecord, Document, Leave, Transaction, TransactionCategory
from django.utils import timezone
from django.contrib.auth import get_user_model


User = get_user_model()

class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True) 

    class Meta:
        model = Employee
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    employees = EmployeeSerializer(many=True, read_only=True) 

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'employees']

class EmployeeReportSerializer(serializers.ModelSerializer):
    employee_full_name = serializers.CharField(source='employee.__str__', read_only=True) 

    class Meta:
        model = EmployeeReport
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_full_name = serializers.CharField(source='employee.__str__', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class LeaveSerializer(serializers.ModelSerializer):
    employee_full_name = serializers.CharField(source='employee.__str__', read_only=True)
    approved_by_username = serializers.CharField(source='approved_by.username', read_only=True)

    class Meta:
        model = Leave
        fields = ['id', 'employee', 'employee_full_name', 'leave_type', 'start_date', 'end_date', 'status', 'reason', 'approved_by', 'approved_by_username']
        read_only_fields = ['status', 'approved_by', 'approved_by_detail']


    def validate_reason(self, value):
        MAX_REASON_LENGTH = 500
        if value and len(value) > MAX_REASON_LENGTH:
            raise serializers.ValidationError(f"Důvod je příliš dlouhý. Maximální délka je {MAX_REASON_LENGTH} znaků.")
        return value

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError("Datum 'Od' nemůže být po datu 'Do'.")
            
            if start_date < timezone.now().date():
                raise serializers.ValidationError({'start_date': 'Žádost o dovolenou nemůže začínat v minulosti.'})

        return data
    
class UserAuthSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'permissions', 'groups']

    def get_permissions(self, obj):
        return list(obj.get_user_permissions()) + list(obj.get_group_permissions())

    def get_groups(self, obj):
        return [group.name for group in obj.groups.all()]
    
class TransactionCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionCategory
        fields = '__all__'
    

class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    recorded_by_details = UserAuthSerializer(source='recorded_by', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__' 
        read_only_fields = ['created_at', 'updated_at', 'recorded_by'] 

    def create(self, validated_data):
        if 'request' in self.context and hasattr(self.context['request'], 'user'):
            validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('recorded_by', None)
        return super().update(instance, validated_data)
    

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = Document
        fields = '__all__'
    