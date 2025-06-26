import { useState, useEffect  } from 'react';
import type { Document } from '../types';
import { documentApi } from '../api';

const Documents: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const fetchedDocuments = await documentApi.getAll();
                setDocuments(fetchedDocuments);

            } catch (err) {
                console.error("Chyba při načítání dat:", err);
                setError("Nepodařilo se načíst data o dovolených nebo zaměstnancích.");
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    return (
        <div className="all_documents">
            <div className="all_documents_content list-item">
                {documents?.map((doc, index) => (
                    <div key={index}>
                        <h3>{doc.title}</h3>
                        <h4>Nahrál/a: {doc.uploaded_by}</h4>
                        <p>{doc.description}</p>
                        <span>Vytvořeno: {doc.uploaded_at.toString().split('T')[0]}</span>
                    </div>
                ))}
                <button>Stáhnout</button>
            </div>
        </div>
    );
};

export default Documents;