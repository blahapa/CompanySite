import React, { useState, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import { departmentsApi } from '../api';
import type { Department } from '../types';

const DepartmentList: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const getDepartments = async () => {
        try {
            const data = await departmentsApi.getAll();
            setDepartments(data);
        } catch (err) {
            setError("Nepodařilo se načíst oddělení. Zkontrolujte, zda běží backend.");
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        getDepartments();
    }, []); 

    const getMoreDetail = (department: string) => {
        navigate('/departments/' + department);
    }

    if (loading) {
        return <p>Načítání oddělení...</p>;
    }
    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="section">
        <h2>Seznam oddělení</h2>
        <div className="list-container">
            {departments.length === 0 ? (
            <p>Žádná oddělení k zobrazení. Zkuste je přidat přes Django Admin.</p>
            ) : (
            departments.map((department) => (
                <div key={department.id} className="list-item" onClick={() => getMoreDetail(department.name)}>
                <h3>{department.name}</h3>
                <p>{department.description || 'Popis není k dispozici.'}</p>
                </div>
            ))
            )}
        </div>
        </div>
    );
};

export default DepartmentList;