from rest_framework import viewsets, status
from .models import Department, Employee, EmployeeReport, AttendanceRecord, Leave, Transaction, TransactionCategory
from .serializers import DepartmentSerializer, EmployeeSerializer, LeaveSerializer, UserAuthSerializer,EmployeeReportSerializer, AttendanceRecordSerializer, TransactionSerializer, TransactionCategorySerializer
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, DjangoModelPermissions
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.db.models import Sum 

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions] 

    lookup_field = 'name'


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def check_in(self, request, pk=None):
        employee = self.get_object()
        date = timezone.now()

        attendance_record_date = AttendanceRecord.objects.filter(employee=employee, date=date).first()
  
        if not attendance_record_date:
            attendance_record = AttendanceRecord.objects.create(
                employee=employee,
                check_in_time=timezone.now()
            )
            return Response({'message': 'Check-in úspěšný!', 'record_id': attendance_record.id}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Check-in už jste dnes provedl!'}, status=status.HTTP_400_BAD_REQUEST )
        
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def check_out(self, request, pk=None):
        employee = self.get_object()
        date = timezone.now()
        attendance_record = AttendanceRecord.objects.filter(employee=employee,check_out_time__isnull=True).order_by('-check_in_time').first() 
        
        attendance_record_date = AttendanceRecord.objects.filter(employee=employee, date=date).first() 
        if  attendance_record_date:
            attendance_record.check_out_time = date
            attendance_record.save()    
            return Response({'message': 'Check-out úspěšný!', 'record_id': attendance_record.id}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Žádný aktivní záznam příchodu k odhlášení pro tohoto zaměstnance.'}, status=status.HTTP_400_BAD_REQUEST)
        
class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all()
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        employee_id = self.request.query_params.get('employee_id', None)
        date_str = self.request.query_params.get('date', None) 

        if employee_id:
            queryset = queryset.filter(employee__id=employee_id)
        if date_str:
            try:
                queryset = queryset.filter(date=date_str)
            except ValueError:
                pass 

        return queryset
class EmployeeReportViewSet(viewsets.ModelViewSet):
    queryset = EmployeeReport.objects.all()
    serializer_class = EmployeeReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()    
        employee_id = self.request.query_params.get('employee_id', None)
        if employee_id is not None:
            queryset = queryset.filter(employee__id=employee_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save()

@api_view(['GET'])
@permission_classes([AllowAny])
def company_stats(request):
    employee_count = Employee.objects.count()
    department_count = Department.objects.count()

    data = {
        'total_employees': employee_count,
        'total_departments': department_count,
    }
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny]) 
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user) 
        user_serializer = UserAuthSerializer(user)
        return Response({'message': 'Přihlášení úspěšné!', 'user': user_serializer.data}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Neplatné přihlašovací údaje.'}, status=status.HTTP_400_BAD_REQUEST)

class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all().select_related("employee", "approved_by")
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions] 

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='HR Specialist').exists() or user.groups.filter(name='CEO').exists() or user.has_perm('api.view_all_leaves'): 
            return Leave.objects.all().order_by('-start_date')
        else:
            try:
                employee = Employee.objects.get(user=user)
                return Leave.objects.filter(employee=employee).order_by('-start_date')
            except Employee.DoesNotExist:
                return Leave.objects.none() 

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None): 
        leave = self.get_object()
        if not request.user.has_perm('api.can_approve_leave'):
            return Response({'detail': 'Nemáte oprávnění schvalovat žádosti o dovolenou.'}, status=status.HTTP_403_FORBIDDEN)
        
        if leave.status == 'PENDING':
            leave.status = 'APPROVED'
            leave.approved_by = request.user
            leave.save()
            return Response({'status': 'Dovolená schválena'}, status=status.HTTP_200_OK)
        return Response({'status': 'Dovolená nemůže být schválena (aktuální stav: ' + leave.status + ')'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if not request.user.has_perm('api.can_approve_leave'):
            return Response({'detail': 'Nemáte oprávnění zamítat žádosti o dovolenou.'}, status=status.HTTP_403_FORBIDDEN)
        
        if leave.status == 'PENDING':
            leave.status = 'REJECTED'
            leave.approved_by = request.user
            leave.save()
            return Response({'status': 'Dovolená zamítnuta'}, status=status.HTTP_200_OK)
        return Response({'status': 'Dovolená nemůže být zamítnuta (aktuální stav: ' + leave.status + ')'}, status=status.HTTP_400_BAD_REQUEST)

class TransactionCategoryViewSet(viewsets.ModelViewSet):
    queryset = TransactionCategory.objects.all().order_by('name')
    serializer_class = TransactionCategorySerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions] 

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.groups.filter(name='Finance Manager').exists() or \
           user.has_perm('api.can_view_all_transactions'):
            return Transaction.objects.all().order_by('-transaction_date', '-created_at')
        
        return Transaction.objects.filter(recorded_by=user).order_by('-transaction_date', '-created_at')

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        user = request.user
        queryset = self.get_queryset()

        total_income = queryset.filter(type='INCOME').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expense = queryset.filter(type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or 0
        net_balance = total_income - total_expense

        category_summary = queryset.values('category__name', 'type').annotate(total=Sum('amount')).order_by('category__name')

        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'net_balance': net_balance,
            'category_summary': category_summary
        })

    @action(detail=False, methods=['get'], url_path='monthly-summary')
    def monthly_summary(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        if not year or not month:
            return Response({'detail': 'Year and month parameters are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return Response({'detail': 'Invalid year or month format.'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset().filter(
            transaction_date__year=year,
            transaction_date__month=month
        )

        monthly_income = queryset.filter(type='INCOME').aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_expense = queryset.filter(type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_net_balance = monthly_income - monthly_expense

        return Response({
            'year': year,
            'month': month,
            'monthly_income': monthly_income,
            'monthly_expense': monthly_expense,
            'monthly_net_balance': monthly_net_balance,
        })
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request) 
    return Response({'message': 'Odhlášení úspěšné.'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user_serializer = UserAuthSerializer(request.user)

    return Response(user_serializer.data, status=status.HTTP_200_OK)  