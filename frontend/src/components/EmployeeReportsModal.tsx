import React, { useState, useEffect, useRef } from 'react';
import { reportsApi  } from '../api';
import type { EmployeeReport } from '../types';

interface EmployeeReportsModalProps {
  employeeId: number;
  onClose: () => void;
}

const EmployeeReportsModal: React.FC<EmployeeReportsModalProps> = ({ employeeId, onClose }) => {
    const [reports, setReports] = useState<EmployeeReport[]>([]);
    const [newReportContent, setNewReportContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const modalContentRef = useRef<HTMLDivElement>(null);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await reportsApi.getByEmployeeId(employeeId);
            setReports(data);
        } catch (err: any) {
            setError("Nepodařilo se načíst reporty.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadReports();
    }, [employeeId]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                onClose();
            } 
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]); 

    const handleAddReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReportContent.trim()) {
            setError("Obsah reportu nemůže být prázdný.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await reportsApi.create(employeeId, newReportContent); 
            setNewReportContent(''); 
            await loadReports(); 
        } catch (err: any) {
            setError("Nepodařilo se přidat report.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };
    const handleDeleteReport = async (reportId: number) => {
        if (window.confirm('Opravdu chcete smazat tento report?')) {
        try {
            await reportsApi.remove(reportId);
            await loadReports(); 
        } catch (err: any) {
            setError("Nepodařilo se smazat report.");
            console.error(err);
        }
        }
    };
    if (loading) {
        return (
            <div className="modal-backdrop">
                <div className="modal-content">
                <h3>Reporty zaměstnance</h3>
                <p>Načítám reporty...</p>
                <button onClick={onClose}>Zavřít</button>
                </div>
            </div>
        );
    }
    return (
        <div className="modal-backdrop">
            <div className="modal-content" ref={modalContentRef}>
                <h3>Reporty zaměstnance</h3>
                {error && <p className="error-message">{error}</p>}

                <h4>Přidat nový report</h4>
                <form onSubmit={handleAddReport} className="report-form">
                    <textarea
                        value={newReportContent}
                        onChange={(e) => setNewReportContent(e.target.value)}
                        placeholder="Napište report..."
                        rows={4}
                        required
                    ></textarea>
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Přidávám...' : 'Přidat report'}
                    </button>
                </form>

                <h4>Seznam reportů</h4>
                {reports.length === 0 ? (
                <p>Pro tohoto zaměstnance nejsou žádné reporty.</p>
                ) : (
                <ul className="report-list">
                    {reports.map((report) => (
                    <li key={report.id}>
                        <p>{report.content}</p>
                        <small>Vytvořeno: {new Date(report.timestamp).toLocaleString()}</small>
                        <button onClick={() => handleDeleteReport(report.id)} className="btn-delete btn-small">Smazat</button>
                    </li>
                    ))}
                </ul>
                )}

                <button onClick={onClose} className="btn-secondary">Zavřít</button>
            </div>
        </div>
    );
}
export default EmployeeReportsModal;
