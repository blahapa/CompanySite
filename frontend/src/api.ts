import type { Employee, Leave, NewLeaveData, Department, CompanyStats, EmployeeReport, 
AttendanceRecord, DepartmentDetailsType, Document, PerformanceReviewType, Transaction, TransactionCategory, TransactionSummary, MonthlyTransactionSummary  } from './types';


const API_BASE_URL = '/api';

function getCookie(name: string): string | null {
  const cookieValue = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
  return cookieValue ? cookieValue.split('=')[1] : null;
}

async function authenticatedFetch<T>(url: string, method: string = 'GET', body?: any): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (method !== 'GET' && method !== 'HEAD') {
    const csrfToken = getCookie('csrftoken'); 
    if (!csrfToken) {
        console.error("CSRF token not found in cookies. This is likely the problem.");
        throw new Error("CSRF token is missing. Please try reloading the page or logging in again.");
    }
    headers['X-CSRFToken'] = csrfToken;
  }
  const options: RequestInit = {
    method: method,
    headers: headers,
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorBody: any;
    try {
      errorBody = await response.json();
    } catch (e) {
      errorBody = await response.text().catch(() => response.statusText);
    }

    let errorMessage = response.statusText;
    if (typeof errorBody === 'object' && errorBody !== null) {
      errorMessage = errorBody.message || errorBody.detail || JSON.stringify(errorBody);
    } else if (typeof errorBody === 'string' && errorBody.length > 0) {
      errorMessage = errorBody;
    }
    throw new Error(errorMessage || `Server vrátil status ${response.status}`);
  }
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return null as T;
  }

  return await response.json() as T; 
}

const api = {
    get: <T>(path: string, params?: URLSearchParams): Promise<T> => authenticatedFetch(path + (params ? `?${params.toString()}` : '')),
    post: <T>(path: string, data: any): Promise<T> => authenticatedFetch(path, 'POST', data),
    put: <T>(path: string, data: any): Promise<T> => authenticatedFetch(path, 'PUT', data),
    delete: <T>(path: string): Promise<T> => authenticatedFetch(path, 'DELETE'),
    patch: <T>(path: string, data: any): Promise<T> => authenticatedFetch(path, 'PATCH', data),
};


export const employeesApi = {
    getAll: () => api.get<Employee[]>(`${API_BASE_URL}/employees/`), 
    create: (employee: Omit<Employee, 'id' | 'department_name'>) => api.post<Employee>(`${API_BASE_URL}/employees/`, employee),
    update: (id: number, employee: Partial<Omit<Employee, 'id' | 'department_name'>>) => api.put<Employee>(`${API_BASE_URL}/employees/${id}/`, employee),
    remove: (id: number) => api.delete<void>(`${API_BASE_URL}/employees/${id}/`),
    checkIn: (id: number) => api.post<{ message: string; record_id: number }>(`${API_BASE_URL}/employees/${id}/check_in/`, null), 
    checkOut: (id: number) => api.post<{ message: string; record_id: number }>(`${API_BASE_URL}/employees/${id}/check_out/`, null), 
    getDetails: (id: number) => api.get<Employee>(`${API_BASE_URL}/employees/${id}/`)
};

export const departmentsApi = {
    getAll: () => api.get<Department[]>(`${API_BASE_URL}/departments/`), 
    getByDepartmentName: (name: string) => api.get<DepartmentDetailsType>(`${API_BASE_URL}/departments/${name}/`)
};

export const reportsApi = {
    getByEmployeeId: (employeeId: number) => api.get<EmployeeReport[]>(`${API_BASE_URL}/reports/?employee_id=${employeeId}`), 
    create: (employeeId: number, content: string) => api.post<EmployeeReport>(`${API_BASE_URL}/reports/`, { content, employee: employeeId }), 
    update: (reportId: number, content: string) => api.put<EmployeeReport>(`${API_BASE_URL}/reports/${reportId}/`, { content }),
    remove: (reportId: number) => api.delete<void>(`${API_BASE_URL}/reports/${reportId}/`), 
};

export const attendanceApi = {
    getHistory: (employeeId?: number, date?: string) => { 
        const params = new URLSearchParams();
        if (employeeId) params.append('employee_id', employeeId.toString());
        if (date) params.append('date', date);
        return api.get<AttendanceRecord[]>(`${API_BASE_URL}/attendance-history/`, params);
    },
    getLeaves: () => api.get<Leave[]>(`${API_BASE_URL}/leaves/`), 
    createLeave: (leaveData: NewLeaveData) => api.post<Leave>(`${API_BASE_URL}/leaves/`, leaveData), 
    approveLeave: (leaveId: number) => api.post<string>(`${API_BASE_URL}/leaves/${leaveId}/approve/`, null), 
    rejectLeave: (leaveId: number) => api.post<string>(`${API_BASE_URL}/leaves/${leaveId}/reject/`, null), 
};

export const authApi = {
    login: (credentials: { username: string; password: string }) => api.post<any>(`${API_BASE_URL}/auth/login/`, credentials), 
    logout: () => api.post<void>(`${API_BASE_URL}/auth/logout/`, null),
    getUserInfo: () => api.get<any>(`${API_BASE_URL}/auth/user/`), 
};
export const companyStats = {
  getCompanyStats:  () => api.get<CompanyStats>(`${API_BASE_URL}/company-stats/`)
}

export const documentApi = {
  getAll: () => api.get<Document[]>('/api/documents/'),
  getDocument: (id: number) => api.get<Document>(`/api/documents/${id}`),
}

export const financeApi = {
    getAllCategories: () => api.get<TransactionCategory[]>('/api/transaction-categories/'),
    createCategory: (data: Omit<TransactionCategory, 'id'>) => api.post<TransactionCategory>('/api/transaction-categories/', data),

    // Transactions
    getAllTransactions: () => api.get<Transaction[]>('/api/transactions/'),
    getTransaction: (id: number) => api.get<Transaction>(`/api/transactions/${id}/`),
    createTransaction: (data: Omit<Transaction, 'id' | 'category_name' | 'recorded_by' | 'recorded_by_details' | 'created_at' | 'updated_at'>) => api.post<Transaction>('/api/transactions/', data),
    updateTransaction: (id: number, data: Partial<Transaction>) => api.patch<Transaction>(`/api/transactions/${id}/`, data),
    deleteTransaction: (id: number) => api.delete<void>(`/api/transactions/${id}/`),

    getTransactionsSummary: () => api.get<TransactionSummary>('/api/transactions/summary/'),
    getMonthlyTransactionsSummary: (year: number, month: number) => api.get<MonthlyTransactionSummary>(`/api/transactions/monthly-summary/?year=${year}&month=${month}`),
};

export const performanceReviewApi = {
    getAll: () => api.get<PerformanceReviewType[]>('/api/performance-reviews/'),
}

export const getCsrfToken = async (): Promise<string | null> => {
    const response = await fetch(`${API_BASE_URL}/auth/csrf/`);
    if (!response.ok) {
        console.error("Failed to fetch CSRF token");
        return null;
    }

    return getCookie('csrftoken'); 
};