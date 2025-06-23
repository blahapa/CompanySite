import { useState, useEffect } from 'react';
import { departmentsApi } from '../api';
import type { DepartmentDetailsType } from '../types';
import { useParams } from 'react-router-dom';


const DepartmentDetails: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { departmentName } = useParams<string>(); 
  const [department, setDepartment] = useState<DepartmentDetailsType | null>(null);

  useEffect(() => {
    const fetchDepartment = async () => {
        if (!departmentName) {
            setError("V URL nebyl zadán název oddělení.");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await departmentsApi.getByDepartmentName(departmentName);
            setDepartment(data);

        } catch (err: any) {
            setError("Nepodařilo se načíst detaily oddělení: " + (err.response?.data?.detail || err.message));
            console.error("Chyba při načítání detailů oddělení:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchDepartment();
  }, [departmentName]);

  if (loading) return <p>Načítání oddělení...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!department) return <p>Oddělení nebylo nalezeno.</p>;

  return (
    <div className="department-details-container">
      <h2>Detaily oddělení: {department.name}</h2>
      <p>ID oddělení: {department.description}</p>
      {department && department.employees && department.employees.length > 0 ? (
          <div className="employees-list-container"> 
              <h3 className="employees-list-title">Zaměstnanci tohoto oddělení:</h3>
              {department.employees.map((employee) => (
                  <div key={employee.id} className="employee-card"> 
                      <h4 className="employee-name">{employee.first_name} {employee.last_name}</h4>
                      <p className="employee-position">Pozice: {employee.position}</p>
                      <p className="employee-email">Email: {employee.email}</p>
                  </div>
              ))}
          </div>
      ) : (
          <p className="no-employees-message">Žádní zaměstnanci k zobrazení, nebo se data načítají.</p>
      )}
    </div>
  );
};

export default DepartmentDetails;