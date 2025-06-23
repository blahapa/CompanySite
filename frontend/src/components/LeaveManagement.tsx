import { useState, useEffect } from 'react';
import { attendanceApi, employeesApi } from '../api';
import type { Employee, Leave, NewLeaveData   } from '../types';

interface LeaveManagementProp {
    isInGroup: (groupName: string) => boolean;    
}

const LeaveManagement: React.FC<LeaveManagementProp> = ({isInGroup}) => {
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]); 
    const [newLeave, setNewLeave] = useState<NewLeaveData>({ 
        employee: '', 
        leave_type: 'VACATION',
        start_date: '',
        end_date: '',
        reason: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeavesAndEmployees = async () => {
            try {
                const fetchedLeaves = await attendanceApi.getLeaves();
                setLeaves(fetchedLeaves);

                const fetchedEmployees = await employeesApi.getAll();
                setEmployees(fetchedEmployees);
            } catch (err) {
                console.error("Chyba při načítání dat:", err);
                setError("Nepodařilo se načíst data o dovolených nebo zaměstnancích.");
            } finally {
                setLoading(false);
            }
        };
        fetchLeavesAndEmployees();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewLeave(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmitLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const MAX_REASON_LENGTH = 500; 
        if (newLeave.reason && newLeave.reason.length > MAX_REASON_LENGTH) {
            setError(`Důvod je příliš dlouhý. Maximální délka je ${MAX_REASON_LENGTH} znaků.`);
            setLoading(false);
            return; 
        }
        if (new Date(newLeave.start_date) > new Date(newLeave.end_date)) {
            setError("Datum 'Od' nemůže být po datu 'Do'.");
            setLoading(false);
            return;
        }
        try {
            const leaveDataToSend = {
                ...newLeave,
                employee: parseInt(newLeave.employee as string, 10),
            };
            const createdLeave = await attendanceApi.createLeave(leaveDataToSend);
            setLeaves(prev => [...prev, createdLeave]); 
            setNewLeave({ 
                employee: '',
                leave_type: 'VACATION',
                start_date: '',
                end_date: '',
                reason: '',
            });
        } catch (err: any) {
            console.error("Chyba při odesílání žádosti:", err.response?.data || err);
            setError("Nepodařilo se odeslat žádost o dovolenou. " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };
    const handleApproveReject = async (leaveId: number, action: 'approve' | 'reject') => {
        setLoading(true);
        setError(null);
        try {
            if (action === 'approve') {
                await attendanceApi.approveLeave(leaveId);
            } else {
                await attendanceApi.rejectLeave(leaveId);
            }
            const updatedLeaves = await attendanceApi.getLeaves();
            setLeaves(updatedLeaves);
        } catch (err: any) {
            console.error(`Chyba při ${action === 'approve' ? 'schvalování' : 'zamítání'} žádosti:`, err.response?.data || err);
            setError(`Nepodařilo se ${action === 'approve' ? 'schválit' : 'zamítnout'} žádost. ` + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-message">Načítání dat...</div>;
    if (error) return <div className="error-message">Chyba: {error}</div>;

    return (
        <div className="leave-management-container">
            <h2 className="page-title">Správa dovolených</h2>
            <div className="leave-request-form-card">
                <h3>Nová žádost o dovolenou</h3>
                <form onSubmit={handleSubmitLeave} className="leave-form">
                    <div className="form-group">
                        <label htmlFor="employee">Zaměstnanec:</label>
                        <select id="employee" name="employee" value={newLeave.employee} onChange={handleInputChange} required>
                            <option value="">Vyberte zaměstnance</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="leave_type">Typ volna:</label>
                        <select id="leave_type" name="leave_type" value={newLeave.leave_type} onChange={handleInputChange} required>
                            <option value="VACATION">Dovolená</option>
                            <option value="SICK">Nemocenská</option>
                            <option value="PERSONAL">Osobní volno</option>
                            <option value="OTHER">Jiné</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="start_date">Od:</label>
                        <input type="date" id="start_date" name="start_date" value={newLeave.start_date} onChange={handleInputChange} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="end_date">Do:</label>
                        <input type="date" id="end_date" name="end_date" value={newLeave.end_date} onChange={handleInputChange} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reason">Důvod (volitelné):</label>
                        <textarea id="reason" name="reason" value={newLeave.reason} onChange={handleInputChange} rows={3}/>
                    </div>
                    <button type="submit" className="submit-button" disabled={loading}>Odeslat žádost</button>
                </form>
            </div>
            <div className="leave-list-card">
                <h3>Přehled žádostí o dovolenou</h3>
                {leaves.length === 0 ? (
                    <p className="no-leaves-message">Žádné žádosti o dovolenou k zobrazení.</p>
                ) : (
                    <ul className="leave-list">
                        {leaves.map((leave) => (
                            <li key={leave.id} className={`leave-item`}>
                                <div className="leave-details">
                                    <p><strong>{leave.employee_full_name || `Zaměstnanec ID: ${leave.employee}`}</strong></p>
                                    <p>Typ: {leave.leave_type}</p>
                                    <p>Období: {leave.start_date} - {leave.end_date}</p>
                                    <p>Status: <span className={`status-label status-${leave.status.toLowerCase()}`}>{leave.status}</span></p>
                                    {leave.reason && <p>Důvod: {leave.reason}</p>}
                                    <p>Schválil: {leave.approved_by_username}</p>
                                </div>
                                {isInGroup("IT") || isInGroup("CEO") && (
                                    <>
                                    {leave.status === 'PENDING' && (
                                        <div className="leave-actions">
                                            <button className="action-button approve" onClick={() => handleApproveReject(leave.id, 'approve')} disabled={loading}>Schválit</button>
                                            <button className="action-button reject" onClick={() => handleApproveReject(leave.id, 'reject')} disabled={loading}>Zamítnout</button>
                                        </div>
                                    )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

}


export default LeaveManagement;