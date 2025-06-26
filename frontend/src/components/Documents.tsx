import { useState, useEffect, useRef  } from 'react';
import type { Document } from '../types';
import { documentApi } from '../api';

const Documents: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>();
    const [documentDetails, setDocumentDetails] = useState<Document>();
    const modalContentRef = useRef<HTMLDivElement>(null);

    const [showDocumentDetails, setShowDocumentDetails] = useState<boolean>(false);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const fetchedDocuments = await documentApi.getAll();
                setDocuments(fetchedDocuments);

            } catch (err) {
                console.error("Chyba při načítání dat:", err);
                setError("Nepodařilo se načíst data o dokumentech.");
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    const handleDetailsDocument = async (id: number) => {
        setLoading(true);
        setShowDocumentDetails(true);
        try {
            const response = await documentApi.getDocument(id);
            setDocumentDetails(response);
        } catch (err: any) {
            console.error("Failed to load transaction:", err.response?.data || err);
            alert("Failed to load transaction: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };
    const onClose = () => {
        setShowDocumentDetails(false);
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


    if (loading) return <p>Načítání dokumentů...</p>;
    if (error)  return <p className="error-message">{error}</p>;
  
    return (
        <div className="all_documents">
                {documents?.map((doc, index) => (
                <div className="all_documents_content" key={index}>
                    <div>
                        <h3>{doc.title}</h3>
                        <h4>Nahrál/a: {doc.uploaded_by}</h4>
                        {doc.description.length < 200 ? (
                            <p>{doc.description}</p>
                        ):(
                            <p>{doc.description.slice(0, 200).concat("...")}</p>
                        )}
                        <span>Vytvořeno: {doc.uploaded_at.toString().split('T')[0]}</span>
                    </div>
                    <div className='document-buttons'>
                        <button onClick={() => handleDetailsDocument(doc.id)}>Detaily</button>
                    <button>Stáhnout</button>
                </div>
                </div>
                ))}
                {showDocumentDetails && (
                    <div className='modal-backdrop'>
                        <div className='modal-content' ref={modalContentRef}>
                            <button onClick={onClose} className='modal-close-button'>Zavřít</button>
                            <h3>{documentDetails?.title}</h3>
                            <h4>Nahrál/a: {documentDetails?.uploaded_by}</h4>
                            <h4>Nahrál/a: {documentDetails?.uploaded_at.toString().split('T')[0]}</h4>
                            <h4>Typ dokumentu: {documentDetails?.document_type} - {documentDetails?.is_public ? "Veřejný" : "Neveřejný"}</h4>
                            {documentDetails?.document_type == "contract" && (
                                <h4>Platnost:  {documentDetails.effective_date} do {documentDetails.contract_end_date}</h4>
                            )}
                            <p>{documentDetails?.description}</p>
                            <span>Vytvořeno: {documentDetails?.uploaded_at.toString().split('T')[0]}</span>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Documents;