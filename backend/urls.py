"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from app_system.views import (
    EmployeeViewSet, DepartmentViewSet, company_stats,
    login_view, logout_view, user_info , EmployeeReportViewSet, AttendanceRecordViewSet, 
    LeaveViewSet, TransactionViewSet, TransactionCategoryViewSet, DocumentViewSet, PerformanceReviewViewSet
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'reports', EmployeeReportViewSet)
router.register(r'attendance-history', AttendanceRecordViewSet) 
router.register(r'leaves', LeaveViewSet)
router.register(r'transaction-categories', TransactionCategoryViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'performance-reviews', PerformanceReviewViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), 
    path('api/company-stats/', company_stats, name='company_stats'),
     # --- Autentizační URL ---
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/user/', user_info, name='user_info'),
]
