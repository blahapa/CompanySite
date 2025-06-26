import { useState, useEffect, useRef } from 'react';
import type {  Transaction, TransactionCategory, TransactionSummary, MonthlyTransactionSummary, UserDetails } from "../types";
import { financeApi } from '../api';

interface FinanceDashboardInterface {
    isInGroup: (groupName: string) => boolean;
    currentUser: UserDetails | null;
}

const FinanceDashboard: React.FC<FinanceDashboardInterface> = ({isInGroup, currentUser}) => {

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [monthlySummary, setMonthlySummary] = useState<MonthlyTransactionSummary | null>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddCathegory, setShowAddCathegory] = useState(false);
    const [showAddDetails, setShowAddDetails] = useState(false);
    const [newCathegoryData, setNewCathegoryData] = useState<Omit<TransactionCategory, 'id'>>({
        name: "",
        description: "",
        type: "EXPENSE"
    });
    const [newTransactionData, setNewTransactionData] = useState<Omit<Transaction, 'id' | 'category_name' | 'recorded_by' | 'recorded_by_details' | 'created_at' | 'updated_at'>>({
        title: '',
        amount: 0,
        type: 'EXPENSE',
        payment_method: 'BANK_TRANSFER',
        transaction_date: new Date().toISOString().split('T')[0], 
        category: null,
        description: ''
    });
    const [showTransactionDetails, setShowTransactionDetails] = useState<Transaction>();

    useEffect(() => {
        if (isInGroup("CEO")) {
            fetchTransactions();
            fetchCategories();
            fetchSummary();

            const today = new Date();
            fetchMonthlySummary(today.getFullYear(), today.getMonth() + 1);
        } else {
            setLoading(false);
            setError("You do not have permission to view finance data.");
        }
    }, [isInGroup("CEO")]);

    const onClose = () => {
        setShowAddDetails(false);
    };
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


    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await financeApi.getAllTransactions();
            
            setTransactions(response);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch transactions:", err);
            setError("Failed to load transactions. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            const response = await financeApi.getAllCategories();
            setCategories(response);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await financeApi.getTransactionsSummary();
            setSummary(response);
        } catch (err) {
            console.error("Failed to fetch summary:", err);
        }
    };

    const fetchMonthlySummary = async (year: number, month: number) => {
        try {
            const response = await financeApi.getMonthlyTransactionsSummary(year, month);
            setMonthlySummary(response);
        } catch (err) {
            console.error("Failed to fetch monthly summary:", err);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewTransactionData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };
    const handleFormCathegoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setNewCathegoryData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value === '' ? null : parseInt(e.target.value);
        setNewTransactionData(prev => ({
            ...prev,
            category: categoryId,
        }));
    };
     const handleSubmitCathegory = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await financeApi.createCategory(newCathegoryData);
            alert('Cathegory added successfully!');
            setNewCathegoryData(newCathegoryData);
            setShowAddCathegory(false);

        } catch (err: any) {
            console.error("Failed to add cathegory:", err.response?.data || err);
            alert("Failed to add cathegory: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };
    const handleSubmitTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await financeApi.createTransaction(newTransactionData);
            alert('Transaction added successfully!');
            setNewTransactionData({
                title: '', amount: 0, type: 'EXPENSE', payment_method: 'BANK_TRANSFER',
                transaction_date: new Date().toISOString().split('T')[0], category: null, description: ''
            });
            setShowAddForm(false);
            fetchTransactions(); 
            fetchSummary();
            const today = new Date();
            fetchMonthlySummary(today.getFullYear(), today.getMonth() + 1);
        } catch (err: any) {
            console.error("Failed to add transaction:", err.response?.data || err);
            alert("Failed to add transaction: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };
    const handleDetailsTransaction = async (id: number) => {
        setLoading(true);
        setShowAddDetails(true);
        try {
            const response = await financeApi.getTransaction(id);
            setShowTransactionDetails(response);
        } catch (err: any) {
            console.error("Failed to load transaction:", err.response?.data || err);
            alert("Failed to load transaction: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!isInGroup("CEO")) return <div className="error-message">You do not have permission to view financial transactions.</div>;
    if (loading) return <div className="loading-message">Loading finance data...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="finance-dashboard-container">
            <h2 className="page-title">Finanční Transakce</h2>
            {summary && (
                <div className="finance-summary-card">
                    <h3>Celkové Schrnutí</h3>
                    <p className="income">Celkové Přijmy: {summary.total_income.toFixed(2)} CZK</p>
                    <p className="expense">Celkové Výdaje: {summary.total_expense.toFixed(2)} CZK</p>
                    <p className={`balance ${summary.net_balance >= 0 ? 'positive' : 'negative'}`}>
                        Čistý Zůstatek: {summary.net_balance.toFixed(2)} CZK
                    </p>
                    <h4>Rozdělení podle kategorií:</h4>
                    <ul className="category-breakdown-list">
                        {summary.category_summary.map((item, index) => (
                            <li key={index}>
                                {item.category__name} ({item.type}): {item.total.toFixed(2)} CZK
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {monthlySummary && (
                <div className="finance-summary-card">
                    <h3>Měsíční Přehled({monthlySummary.month}/{monthlySummary.year})</h3>
                    <p className="income">Měsíční Příjem: {monthlySummary.monthly_income.toFixed(2)} CZK</p>
                    <p className="expense">Měsíční Výdaj: {monthlySummary.monthly_expense.toFixed(2)} CZK</p>
                    <p className={`balance ${monthlySummary.monthly_net_balance >= 0 ? 'positive' : 'negative'}`}>
                        Měsíční Čistý Zůstatek: {monthlySummary.monthly_net_balance.toFixed(2)} CZK
                    </p>
                </div>
            )}
            {isInGroup("CEO") && (
                <div className="add-transaction-section">
                    <button className="toggle-form-button" onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? 'Schovat Formulář' : 'Přidej Novou Transakci'}
                    </button>
                    <button className="toggle-form-button" onClick={() => setShowAddCathegory(!showAddCathegory)}>
                    {showAddCathegory ? 'Schovat Formulář' : 'Přidej Novou Kategorii'}
                    </button>
                    {showAddForm && (
                        <div className="transaction-form-card">
                            <h3>Přidej Novou Transakci</h3>
                            <form onSubmit={handleSubmitTransaction} className="transaction-form">
                                <div className="form-group">
                                    <label htmlFor="title">Název:</label>
                                    <input type="text" id="title" name="title" value={newTransactionData.title} onChange={handleFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="amount">Částka (CZK):</label>
                                    <input type="number" id="amount" name="amount" value={newTransactionData.amount} onChange={handleFormChange} required step="0.01" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="type">Typ:</label>
                                    <select id="type" name="type" value={newTransactionData.type} onChange={handleFormChange} required>
                                        <option value="INCOME">Příjem</option>
                                        <option value="EXPENSE">Výdaj</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Kategorie:</label>
                                    <select id="category" name="category" value={newTransactionData.category || ''} onChange={handleCategoryChange}>
                                        <option value="">Žádna Kategorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="payment_method">Platebná Metody:</label>
                                    <select id="payment_method" name="payment_method" value={newTransactionData.payment_method} onChange={handleFormChange} required>
                                        <option value="BANK_TRANSFER">Bankovná Převod</option>
                                        <option value="CASH">Hotově</option>
                                        <option value="CARD">Kartou</option>
                                        <option value="OTHER">Jiné</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="transaction_date">Datum:</label>
                                    <input type="date" id="transaction_date" name="transaction_date" value={newTransactionData.transaction_date} onChange={handleFormChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Popisek:</label>
                                    <textarea id="description" name="description" value={newTransactionData.description || ''} onChange={handleFormChange}></textarea>
                                </div>
                                <button type="submit" className="submit-button" disabled={loading}>Přidej Transakci</button>
                            </form>
                        </div>
                    )}
                    {showAddCathegory && (
                         <div className="transaction-form-card">
                            <h3>Přidej Novou Kategorii</h3>
                            <form onSubmit={handleSubmitCathegory} className="transaction-form">
                                <div className="form-group">
                                    <label htmlFor="title_cathegory">Název:</label>
                                    <input type="text" id="title_cathegory" name="name" value={newCathegoryData.name}  onChange={handleFormCathegoryChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description_cathegory">Popisek:</label>
                                    <textarea id="description_cathegory" name="description" value={newCathegoryData.description || ''}  onChange={handleFormCathegoryChange} ></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="type">Typ:</label>
                                    <select id="type" name="type" value={newCathegoryData.type}  onChange={handleFormCathegoryChange} required>
                                        <option value="INCOME">Příjem</option>
                                        <option value="EXPENSE">Výdaj</option>
                                    </select>
                                </div>
                                <button type="submit" className="submit-button" disabled={loading}>Přidej Kategorii</button>
                            </form>
                        </div>
                    )}
                </div>
            )}
            <div className="transaction-list-section">
                <h3>Všechny Transakce</h3>
                {transactions.length === 0 ? (
                    <p className="no-transactions-message">Žádné transakce k zobrazení.</p>
                ) : (
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Název</th>
                                <th>Kategorie</th>
                                <th>Typ</th>
                                <th>Částka (CZK)</th>
                                <th>Methoda</th>
                                <th>Nahrál/a</th>
                                <th>Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} className={t.type === 'INCOME' ? 'income-row' : 'expense-row'}>
                                    <td>{t.transaction_date}</td>
                                    <td>{t.title}</td>
                                    <td>{t.category_name || 'N/A'}</td>
                                    <td>{t.type}</td>
                                    <td>{t.amount}</td>
                                    <td>{t.payment_method}</td>
                                    <td>{t.recorded_by_details ? `${t.recorded_by_details.username}` : 'N/A'}</td>
                                    <td>
                                        {(isInGroup("CEO") && t.recorded_by === currentUser?.id) || isInGroup("CEO") ? (
                                            <button className="details-button" onClick={() => handleDetailsTransaction(t.id)}>Details</button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {showAddDetails &&(
                <div className='modal-backdrop'>
                    <div className='modal-content transaction-details' ref={modalContentRef}>
                        <button onClick={onClose} className='modal-close-button'>Zavřít</button>
                        <h1>{showTransactionDetails?.id} - {showTransactionDetails?.title} <span>({showTransactionDetails?.category_name ? showTransactionDetails.category_name: "N/A"})</span></h1>
                        <h3>{showTransactionDetails?.transaction_date}</h3>
                        <h4>Typ: {showTransactionDetails?.type}</h4>
                        <h4>Částka: {showTransactionDetails?.amount} CZK</h4>
                        <h4>Platební metoda: {showTransactionDetails?.payment_method}</h4>
                        <h4>Vytvořeno: {showTransactionDetails?.recorded_by_details?.username}</h4>
                        <p>Popisek: {showTransactionDetails?.description ? showTransactionDetails?.description : "N/A"}</p>
                    </div>
                </div>
            )}
        </div>
    );

}

export default FinanceDashboard;