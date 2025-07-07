import React, { useState, useEffect, useRef } from 'react';
import { attendanceApi  } from '../api';
import type { AttendanceRecord } from '../types';

interface AttendanceHistoryModalProps {
    employeeId: number;
    onClose: () => void;
}

const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ employeeId, onClose }) => {
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState('');

    const modalContentRef = useRef<HTMLDivElement>(null);

    const loadAttendance = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await attendanceApi .getHistory(employeeId, filterDate || undefined);
            setAttendanceRecords(data);
        } catch (err: any) {
            setError("Nepodařilo se načíst historii docházky.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, [employeeId, filterDate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                onClose();
            } 
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside);};
    }, [onClose]); 

    return (
        <div className="modal-backdrop">
            <div className="modal-content"  ref={modalContentRef}>
                <button onClick={onClose} className="modal-close-button">Zavřít</button>
                <h3>Historie docházky</h3>
                {error && <p className="error-message">{error}</p>}

                <div className="filter-section">
                <label htmlFor="filterDate">Filtrovat datum:</label>
                <input
                    type="date"
                    id="filterDate"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
                <button onClick={() => setFilterDate('')} className="btn-clear-filter">Vymazat filtr</button>
            </div>
            {loading ? (
            <p>Načítám historii docházky...</p>
            ) : attendanceRecords.length === 0 ? (
            <p>Pro tohoto zaměstnance nejsou žádné záznamy docházky {filterDate ? `pro datum ${filterDate}` : ''}.</p>
            ) : (
            <ul className="attendance-list">
                {attendanceRecords.map((record) => (
                <li key={record.id}>
                    <div>
                    <strong>Datum:</strong> {record.date}
                    </div>
                    <div>
                    <strong>Příchod:</strong> {new Date(record.check_in_time).toLocaleTimeString('cs-CZ')}
                    </div>
                    <div>
                    <strong>Odchod:</strong>{' '}
                    {record.check_out_time
                        ? new Date(record.check_out_time).toLocaleTimeString('cs-CZ')
                        : 'Nezaznamenáno'}
                    </div>
                </li>
                ))}
            </ul>
            )}
        </div>
        </div>
    );
};

export default AttendanceHistoryModal;