import { useState, useEffect } from 'react';
import { employeesApi } from '../api';
import type { Employee } from '../types';
import { useParams } from 'react-router-dom';


const EmployeeDetails: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { employee_id } = useParams<{ employee_id: string }>();
    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            if (!employee_id) {
                setError("V URL nebyl zadán zaměstnanec.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await employeesApi.getDetails(parseInt(employee_id, 10));
                setEmployee(data);

            } catch (err: any) {
                setError("Nepodařilo se načíst detaily zaměstnance: " + (err.response?.data?.detail || err.message));
                console.error("Chyba při načítání detailů zaměstnance:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeDetails();
    }, [employee_id]);

    
    if (loading) return <p>Načítání oddělení...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!employee) return <p>Zaměstnanec nebyl nalezen.</p>;

    return (
        <div>
        <h3>{employee.first_name} {employee.last_name} ({employee.date_of_birth})</h3>
        <div>
            <p>Email: {employee.email}</p>
            <p>Oddělení: {employee.department_name}</p>
            <p>Pozice: {employee.position}</p>
            <p>Lokace: {employee.location}</p>
        </div>
        </div>
    );
};

export default EmployeeDetails;