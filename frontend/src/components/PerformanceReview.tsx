import { useState, useEffect  } from 'react';
import type { PerformanceReviewType } from '../types';
import { performanceReviewApi } from '../api';

const PerformanceReview: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<PerformanceReviewType[]>();


    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const fetchedReviews = await performanceReviewApi.getAll();
                setReviews(fetchedReviews);

            } catch (err) {
                console.error("Chyba při načítání dat:", err);
                setError("Nepodařilo se načíst data o hodnoceních.");
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) return <p>Načítání dokumentů...</p>;
    if (error)  return <p className="error-message">{error}</p>;
    return (
        <div className="all_reviews">
                {reviews?.map((review, index) => (
                <div className="all_reviews_content" key={index}>
                    <div>
                        <h2>{review.employee} - {review.average_score}</h2>
                        <h4>Hodnotil/a: {review.reviewer}</h4>
                        <span className='date_span'>Datum: {review.date.toString().split('T')[0]}</span>
                        <h3>Kritéria</h3>
                        <ul className='review_params'>
                            <li>Kvalita práce: {review.quality_of_work}</li>
                            <li>Docházka: {review.attendance}</li>
                            <li>Komunikace: {review.communication}</li>
                            <li>Týmová práce: {review.teamwork}</li>
                            <li>Iniciativita: {review.initiative}</li>
                        </ul>
                        <p id='review_comentar'>Komentář: {review.comments}</p>
                        <p>Doporučení: {review.recommended_training}</p>
                    </div>
                </div>
                ))}
        </div>
    );
};

export default PerformanceReview;