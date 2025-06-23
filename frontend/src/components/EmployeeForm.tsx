import React, { useState, useEffect } from 'react';
import { employeesApi, departmentsApi } from '../api'; 
import type { Employee, Department } from '../types';

interface EmployeeFormProps {
    onEmployeeAdded: () => void; 
    onEmployeeUpdated: () => void; 
    employeeToEdit?: Employee | null; 
    onCancelEdit?: () => void; 
    isInGroup: (groupName: string) => boolean;    
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onEmployeeAdded, onEmployeeUpdated, employeeToEdit, onCancelEdit, isInGroup }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [position, setPosition] = useState('');
    const [department, setDepartment] = useState<number | ''>(''); 
    const [location, setLocation] = useState(''); 
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDepartments = async () => {
        try {
            const data = await departmentsApi.getAll(); 
            setDepartments(data);
        } catch (err: any) {
            console.error("Nepodařilo se načíst oddělení:", err);
            setError("Nepodařilo se načíst seznam oddělení.");
        }
        };
        loadDepartments();
    }, []);
    useEffect(() => {
        if (employeeToEdit) {
            setFirstName(employeeToEdit.first_name);
            setLastName(employeeToEdit.last_name);
            setEmail(employeeToEdit.email);
            setPhoneNumber(employeeToEdit.phone_number || "");
            setPosition(employeeToEdit.position);
            setDepartment(employeeToEdit.department ?? "");

            setLocation(employeeToEdit.location || ''); 
        } else {
            setFirstName('');
            setLastName('');
            setEmail('');
            setPhoneNumber('');
            setPosition('');
            setDepartment('');
            setLocation('');
            setError(null); 
            }
    }, [employeeToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!department) {
            setError("Prosím, vyberte oddělení.");
            return;
        }
        setLoading(true);
        setError(null); 

        const employeeData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber,
            position: position,
            department: department as number, 
            location: location,
        };
        try {
            if (employeeToEdit) {
                await employeesApi.update(employeeToEdit.id, employeeData);
                onEmployeeUpdated(); 
            } else {
                await employeesApi.create(employeeData);
                onEmployeeAdded(); 
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhoneNumber('');
                setPosition('');
                setDepartment('');
                setLocation('');
            }
        } catch (err: any) {
            setError(err.message || "Nepodařilo se uložit zaměstnance.");
        } finally {
            setLoading(false);
        }
    }
    const handleCancel = () => {
        if (onCancelEdit) {
            onCancelEdit();
        }
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
        setPosition('');
        setDepartment('');
        setLocation('');
        setError(null);
    };
      return (  
        <>  
            {isInGroup("IT") || isInGroup("CEO") ? (
            <div className="employee-form-container">
            <h3>{employeeToEdit ? 'Upravit zaměstnance' : 'Přidat nového zaměstnance'}</h3>
            {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} className="employee-form">
                    <input type="text" placeholder="Jméno" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                    <input type="text" placeholder="Příjmení" value={lastName}onChange={(e) => setLastName(e.target.value)} required/>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    <input type="tel" placeholder="Telefonní číslo" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}/>
                    <input type="text" placeholder="Pozice" value={position} onChange={(e) => setPosition(e.target.value)} required/>
                    <select value={department} onChange={(e) => setDepartment(Number(e.target.value))} required>
                        <option value="">Vyberte oddělení</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                            {dept.name}
                            </option>
                        ))}
                    </select>
                    <input type="text" placeholder="Lokace (např. 'Praha')" value={location} onChange={(e) => setLocation(e.target.value)}/>
                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Ukládám...' : employeeToEdit ? 'Uložit změny' : 'Přidat'}
                        </button>
                        {employeeToEdit && (
                            <button type="button" onClick={handleCancel} disabled={loading} className="btn-secondary">
                            Zrušit úpravy
                            </button>
                        )}
                    </div>
                </form>
            </div> 
           ) : (
            <p className="no-access-message">Nemáte oprávnění k přidávání/úpravě zaměstnanců.</p>
            )}
        </>
    );
}

export default EmployeeForm;