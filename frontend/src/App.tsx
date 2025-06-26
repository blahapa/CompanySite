import { Routes, Route, Link, useNavigate, useLocation  } from 'react-router-dom';
import { useState, useEffect } from 'react';

import EmployeeList from './components/EmployeeList';
import DepartmentList from './components/DepartmentList';
import EmployeeForm from './components/EmployeeForm';
import Home from './components/Home';
import DepartmentDetails from'./components/DepartmenDetails';
import LeaveManagement from'./components/LeaveManagement';
import SystemActions from'./components/SystemActions';
import EmployeeDetails from'./components/EmployeeDetails';
import FinanceDashboard from './components/FinanceDashboard';
import Calendar from'./components/Calendar';
import LoginForm from './components/LoginForm';
import Documents from './components/Documents';
import { authApi } from './api';
import type { UserDetails   } from './types';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserDetails, setCurrentUserDetails] = useState<UserDetails | null>(null); 
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true); 
  const [addUserVisibility, setAddUserVisibility] = useState<boolean>(false); 
  const [employeeListRefreshCounter, setEmployeeListRefreshCounter] = useState(0);


  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userInfo = await authApi.getUserInfo();
        setCurrentUserDetails(userInfo);
        setCurrentUser(userInfo.username);
        setIsAuthenticated(true);

      } catch (error: any) {
        if (error.message.includes('Authentication required') || error.message.includes('forbidden')) {
            setIsAuthenticated(false);
            setCurrentUser(null);
            if (location.pathname !== '/login' && location.pathname !== '/') {
                navigate('/login');
            }
        } else {
            console.error("Chyba při kontrole autentizace:", error);
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, [navigate, location.pathname]);

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    navigate('/'); 
    setEmployeeListRefreshCounter(prev => prev + 1);
  };
  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      navigate('/login'); 
    } catch (error) {
      console.error("Chyba při odhlášení:", error);
      alert("Nepodařilo se odhlásit. Zkuste to znovu.");
    }
  };
  const handleEmployeeChange = () => {
    setEmployeeListRefreshCounter(prev => prev + 1); 
  };
  const handleShowAddUser = () => {
    if (addUserVisibility) {
      setAddUserVisibility(false);
    } else {
      setAddUserVisibility(true);
    }
  };
  const isInGroup = (groupName: string): boolean => {
      return currentUserDetails?.groups.includes(groupName) || false;
  };


  if (loadingAuth) {
    return <div className="container" style={{ textAlign: 'center', padding: '50px' }}>Načítání aplikace...</div>;
  }

  return (
    <div className="container">
      <h1>Firemní Systém</h1>

      <nav className="main-nav"> 
        <ul>
          <li><Link to="/">Úvod</Link></li>
          {isAuthenticated && (
          <>
            <li><Link to="/employees">Zaměstnanci</Link></li>
            <li><Link to="/departments">Oddělení</Link></li>
            <li><Link to="/action">Akce</Link></li>
            <li><span>Vítejte, {currentUser}</span></li>
            <li><button onClick={handleLogout} className="logout-button">Odhlásit se</button></li>
          </>
          )}
          {!isAuthenticated && (
            <li><Link to="/login">Přihlásit se</Link></li>
          )}
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
        {isAuthenticated ? (
        <>
          <Route path="/employees" element={
            <>
              <div className="section">
                {isInGroup("IT") || isInGroup("CEO")  && (
                  <>
                <h2>Správa zaměstnanců</h2>
                <button onClick={handleShowAddUser}>Přidat zaměstnance {addUserVisibility}</button>
                { addUserVisibility && ( 
                    <EmployeeForm onEmployeeAdded={handleEmployeeChange} onEmployeeUpdated={handleEmployeeChange} isInGroup={isInGroup}/>
                )}
                </>
                )}
                </div>
              <EmployeeList refreshTrigger={employeeListRefreshCounter} onEmployeeUpdated={handleEmployeeChange}  isInGroup={isInGroup} />
            </>
          } />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="/departments/:departmentName" element={<DepartmentDetails />} />
          <Route path="/leaves" element={<LeaveManagement isInGroup={isInGroup} />} />
          <Route path="/action" element={<SystemActions />}  />
          <Route path="/employees/:employee_id" element={<EmployeeDetails />}  />
          <Route path="/calendar" element={<Calendar />}  />
          <Route path="/documents" element={<Documents />}  />
          <Route path="/finance" element={<FinanceDashboard isInGroup={isInGroup} currentUser={currentUserDetails} />} />
        </>
        ) : (
          <Route path="/*" element={
            <div className="section">
              <p>Pro přístup k této sekci se prosím přihlaste.</p>
              <Link to="/login">Přejít na přihlášení</Link>
            </div>
          } />
        )}
      </Routes>
    </div>
  );
}
export default App
