import { useState, useEffect, useMemo, useCallback  } from 'react';
import type { CalendarDay, Leave, LeaveDateCalendar } from '../types';
import { attendanceApi } from '../api';

const Calendar: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leaves, setLeaves] = useState<Leave[]>();

    const [currentDate, setCurrentDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay() || 7; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();

    useEffect(() => {
        const fetchLeavesAndEmployees = async () => {
            try {
                const fetchedLeaves = await attendanceApi.getLeaves();
                setLeaves(fetchedLeaves);

            } catch (err) {
                console.error("Chyba při načítání dat:", err);
                setError("Nepodařilo se načíst data o dovolených nebo zaměstnancích.");
            } finally {
                setLoading(false);
            }
        };
        fetchLeavesAndEmployees();
    }, []);

    const getLeavesFormatted = useMemo((): LeaveDateCalendar[] => {
        const getDates: LeaveDateCalendar[] = [];
        if (leaves && leaves.length > 0) {
            for (const element of leaves) {
                if (element.status === "APPROVED") {
                    getDates.push({
                        start: new Date(element.start_date),
                        end: new Date(element.end_date),
                        type: element.leave_type,
                    });
                }
            }
        }
        return getDates;
    }, [leaves]);

    const getDatesBetween = useCallback((startDate: Date, endDate: Date): string[] => {
        const dates: string[] = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            dates.push(current.toDateString());
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }, []);

    const getAllEvenetDates = useMemo((): string[][] => {
        const newData: string[][] = [];
        if (getLeavesFormatted && getLeavesFormatted.length > 0) {
            for (const element of getLeavesFormatted) {
                const getAllLeavesDates = getDatesBetween(element.start, element.end);
                newData.push(getAllLeavesDates);
            }
        }
        return newData;
    }, [getLeavesFormatted, getDatesBetween]); 


    const generateCalendar = useMemo((): CalendarDay[] => {
        const days: CalendarDay[] = [];

        const startDayIndex = (firstDayOfMonth === 0) ? 6 : (firstDayOfMonth - 1); 

        for (let i = 0; i < startDayIndex; i++) {
            days.push({ day: 0, isToday: false, isCurrentMonth: false, eventToday: false, eventName: "" });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDateLoop = new Date(year, month, day);

            let eventToday = false;
            let eventName = "";

            const specificLeaveForDay = getLeavesFormatted.find(leave => {
                return currentDateLoop >= leave.start && currentDateLoop <= leave.end;
            });

            if (specificLeaveForDay) {
                eventToday = true;
                eventName = specificLeaveForDay.type;
            }

            const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

            days.push({ day, isToday, isCurrentMonth: true, eventToday, eventName });
        }
        return days;
    }, [year, month, getLeavesFormatted, getAllEvenetDates]);

    const goToPreviousMonth = () => {
        const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        setCurrentDate(prev);
    };
    const goToNextMonth = () => {
        const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        setCurrentDate(next);
    };

    if (loading) return <div className="loading-message">Načítání dat...</div>;
    if (error) return <div className="error-message">Chyba: {error}</div>;

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={goToPreviousMonth}>Předtím</button>
                <h2>{currentDate.toLocaleString("cs-CZ", { month: "long", year: "numeric" })}</h2>
                <button onClick={goToNextMonth}>Další</button>
            </div>
        <div className="calendar-grid">
            {["Po", "Ut", "St", "Čt", "Pa", "So", "Ne"].map((day) => (
                <div key={day} className="calendar-day label">{day}</div>
            ))}
            {generateCalendar.map((day, index) => (
            <div key={index} className={`calendar-day ${day.isToday ? "today" : ""}${!day.isCurrentMonth ? "other-month" : ""}${day.eventToday ? "eventToday" : ""}`}>
            {day.day !== 0 ? day.day : ""}
                {(day.eventToday || day.isToday) && (
                <div className="tooltip">
                    {day.eventToday ? day.eventName : "Dnešní den"}
                </div>
                )}
            </div>
            ))}
        </div>
        </div>
    );
};


export default Calendar;