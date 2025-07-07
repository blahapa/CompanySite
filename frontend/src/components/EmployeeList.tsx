import React, { useState, useEffect } from 'react';
import { employeesApi, departmentsApi } from '../api';
import type { Employee, Department } from '../types';
import EmployeeReportsModal from './EmployeeReportsModal';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import EmployeeForm from './EmployeeForm';
import { useNavigate  } from 'react-router-dom';

interface EmployeeListProps {
  refreshTrigger: number; 
  onEmployeeUpdated: () => void; 
  isInGroup: (groupName: string) => boolean;    
}
const EmployeeList: React.FC<EmployeeListProps> = ({ refreshTrigger, onEmployeeUpdated, isInGroup }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedEmployeeIdForAttendance, setSelectedEmployeeIdForAttendance] = useState<number | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const [showReportsModal, setShowReportsModal] = useState(false);
    const [selectedEmployeeIdForReports, setSelectedEmployeeIdForReports] = useState<number | null>(null);

    const navigate = useNavigate();

    const loadEmployeesAndDepartments = async () => {
        try {
            setLoading(true);
            setError(null);
            const employeesData = await employeesApi.getAll(); 
            setEmployees(employeesData);

            const departmentsData = await departmentsApi.getAll(); 
            setDepartments(departmentsData);

        } catch (err: any) {
            setError("Nepodařilo se načíst data zaměstnanců nebo oddělení.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadEmployeesAndDepartments();
    }, [refreshTrigger]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Opravdu chcete smazat tohoto zaměstnance?')) {
        try {
            await employeesApi.remove(id); 
            await loadEmployeesAndDepartments(); 
            if (editingEmployee && editingEmployee.id === id) {
            setEditingEmployee(null); 
            }
            onEmployeeUpdated(); 
        } catch (err: any) {
            setError(err.message || "Nepodařilo se smazat zaměstnance.");
            console.error(err);
        }
        }
    };
    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
    };

    const handleCancelEdit = () => {
        setEditingEmployee(null);
    };
    const handleCheckIn = async (employeeId: number) => {
        try {
        await employeesApi.checkIn(employeeId); 
        alert("Příchod zaznamenán!");

        } catch (err) {
        console.error("Chyba při příchodu zaměstnance:", err);
        alert("Nepodařilo se zaznamenat příchod.");
        }
    };
    const handleCheckOut = async (employeeId: number) => {  
        try {
        await employeesApi.checkOut(employeeId);
        alert("Odchod zaznamenán!");
        } catch (err) {
        console.error("Chyba při odchodu zaměstnance:", err);
        alert("Nepodařilo se zaznamenat odchod.");
        }
    };
    const getMoreDetail = (employee_id: number) => {
        navigate('/employees/' + employee_id);
    }

    const handleViewReports = (employeeId: number) => {
        setSelectedEmployeeIdForReports(employeeId);
        setShowReportsModal(true);
    };

    const handleCloseReportsModal = () => {
        setShowReportsModal(false);
        setSelectedEmployeeIdForReports(null);
    };
    const handleViewAttendanceHistory = (employeeId: number) => {
        setSelectedEmployeeIdForAttendance(employeeId);
        setShowAttendanceModal(true); 
    };

    const handleCloseAttendanceModal = () => {
        setShowAttendanceModal(false); 
        setSelectedEmployeeIdForAttendance(null);
    };

    if (loading) {
        return <p>Načítání zaměstnanců...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }
    return (
    <div className="employee-list-container">
        <h2>Seznam zaměstnanců</h2>

        {editingEmployee && (
            <EmployeeForm
            employeeToEdit={editingEmployee}
            onEmployeeUpdated={() => {
                loadEmployeesAndDepartments(); 
                handleCancelEdit(); 
                onEmployeeUpdated(); 
            }}
            onEmployeeAdded={onEmployeeUpdated} 
            onCancelEdit={handleCancelEdit}
            isInGroup={isInGroup}
            />
        )}

        {!editingEmployee && employees.length === 0 ? (
            <p>Žádní zaměstnanci k zobrazení. Přidejte nějaké!</p>
        ) : (
            <ul className="employee-list">
            {employees.map((employee) => (
                <li key={employee.id} className="employee-item">
                <div onClick={() => getMoreDetail(employee.id)}>
                    <strong>{employee.first_name} {employee.last_name}</strong> ({employee.position})
                </div>
                <small>Oddělení: {departments.find(d => d.id === employee.department)?.name || 'Neznámé'}</small>
                <small>Lokace: {employee.location || 'Neznámá'}</small>
                {isInGroup("IT")|| isInGroup("CEO") && (
                <div className="employee-actions">
                    <button onClick={() => handleEdit(employee)} className="btn-edit">Upravit</button>
                    <button onClick={() => handleDelete(employee.id)} className="btn-delete">Smazat</button>
                    <button onClick={() => handleCheckIn(employee.id)} className="btn-checkin">Příchod</button>
                    <button onClick={() => handleCheckOut(employee.id)} className="btn-checkout">Odchod</button>
                    <button onClick={() => handleViewReports(employee.id)} className="btn-reports">Reporty</button>
                    <button onClick={() => handleViewAttendanceHistory(employee.id)} className="btn-history">Historie docházky</button>
                </div>
                    )}
                </li>
            ))}
            </ul>
        )}

        {showReportsModal && selectedEmployeeIdForReports && (
            <EmployeeReportsModal
            employeeId={selectedEmployeeIdForReports}
            onClose={handleCloseReportsModal}
            />
        )}
        {showAttendanceModal && selectedEmployeeIdForAttendance && (
            <AttendanceHistoryModal
            employeeId={selectedEmployeeIdForAttendance}
            onClose={handleCloseAttendanceModal}
            />
        )}
        </div>
    );
};

export default EmployeeList;