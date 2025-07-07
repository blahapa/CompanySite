import { Link  } from 'react-router-dom'; 


const SystemActions: React.FC = () => {
    return (
        <div>
            <h3>Akce, které budeš moct provest!</h3>
            <div className='action-card'><Link to="/leaves">Absence</Link></div>
            <div className='action-card'><Link to="/calendar">Kalendář</Link></div>
            <div className='action-card'><Link to="/finance">Finance</Link></div>
            <div className='action-card'><Link to="/documents">Dokumenty</Link></div>
            <div className='action-card'><Link to="/performancereviews">Hodnocení</Link></div>
        </div>
    );
};
export default SystemActions;