import React, { useState, useEffect } from 'react';
import type { CompanyStats } from '../types'; 
import { companyStats } from '../api'; 

const Home: React.FC = () => {
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getCompanyStats = async () => {
        try {
            const data = await companyStats.getCompanyStats();
            setStats(data);
        } catch (err) {
            setError("Nepodařilo se načíst firemní statistiky. Zkontrolujte, zda běží backend.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    getCompanyStats();
     }, []);

    return (
        <div className="section home-section">
        <h2 className="home-title">Vítejte ve Firemním Systému!</h2>
        <p className="home-description">
            Tato aplikace slouží pro správu zaměstnanců a oddělení ve vaší společnosti.
            Procházejte menu nahoře pro přístup k jednotlivým sekcím.
        </p>
        <div className="stats-cards-container">
            {loading && <p>Načítání statistik...</p>}
            {error && <p className="error-message">{error}</p>}
            {stats && (
            <>
                <div className="stat-card">
                <h3>Celkový počet zaměstnanců</h3>
                <p className="stat-value">{stats.total_employees}</p>
                </div>
                <div className="stat-card">
                <h3>Celkový počet oddělení</h3>
                <p className="stat-value">{stats.total_departments}</p>
                </div>
            </>
            )}
        </div>

        <div className="info-box">
            <p>Tyto statistiky se načítají z API vašeho Django backendu.</p>
            <p>Pro správu dat (přidání, úpravy) použijte sekce Zaměstnanci a Oddělení nebo Django Admin.</p>
        </div>
        </div>
    );
};

export default Home;