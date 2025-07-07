import React, { useState } from 'react';
import { authApi } from '../api';

interface LoginFormProps {
  onLoginSuccess: (username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
        const response = await authApi.login({ username, password });
        onLoginSuccess(response.username); 
        } catch (err: any) {
        setError(err.message || "Nepodařilo se přihlásit. Zkuste to znovu.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="form-container auth-form">
            <h2>Přihlášení</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                <label htmlFor="username">Uživatelské jméno:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                </div>
                <div className="form-group">
                <label htmlFor="password">Heslo:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Přihlašování...' : 'Přihlásit se'}
                </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;