export interface Department {
  id: number;
  name: string;
  description: string;
}
export interface DepartmentDetailsType {
  id: number;
  name: string;
  description: string;
  employees: Employee[];
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  department: number | null; 
  department_name: string | null; 
  email: string;
  phone_number?: string; 
  location?: string | null;
  date_of_birth: string;
}
export interface CompanyStats {
  total_employees: number;
  total_departments: number;

}
export interface EmployeeReport {
  id: number;
  employee: number;
  employee_full_name: string;
  timestamp: string;
  content: string;
}
export interface AttendanceRecord {
  id: number;
  employee: number; 
  employee_full_name: string; 
  check_in_time: string; 
  check_out_time?: string | null; 
  date: string; 
}
export interface Leave {
  id: number;
  employee: number; 
  employee_full_name: string; 
  leave_type: string;
  start_date: string; 
  end_date: string;   
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
  approved_by_username: string;
}
export interface NewLeaveData {
  employee: number | string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
}
export interface UserDetails {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  permissions: string[]; 
  groups: string[];
}
export interface CalendarDay {
  day: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  eventToday: boolean;
  eventName: string;
}
export interface LeaveDateCalendar  {
  start: Date;
  end: Date;
  type: string;
};

export interface TransactionCategory {
  id: number;
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
}
export interface Transaction {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category?: number | null; 
  category_name?: string;  
  type: 'INCOME' | 'EXPENSE';
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  transaction_date: string; 
  recorded_by?: number | null; 
  recorded_by_details?: { id: number; first_name: string; last_name: string; username: string; } | null;
  created_at: string;
  updated_at: string;
}
export interface TransactionSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  category_summary: { category__name: string; type: 'INCOME' | 'EXPENSE'; total: number; }[];
}
export interface MonthlyTransactionSummary {
  year: number;
  month: number;
  monthly_income: number;
  monthly_expense: number;
  monthly_net_balance: number;
}
export interface Document {
  id: number;
  title: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
  employee: Employee;
  document_type: string;
  is_public: boolean;
  effective_date?: string;
  contract_end_date?: string;
}
export interface PerformanceReviewType {
  employee: string;
  reviewer?: string;
  date: string;
  period: string;
  quality_of_work: number;
  attendance: number;
  communication: number;
  teamwork: number;
  initiative: number;
  comments?: string;
  recommended_training?: string;
  average_score: number;
}