import { useState } from 'react';

export const useStudyVerseAI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const askVera = async (query, lessonTitle, userName = "Student") => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:8001/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: 'study_verse',
                    query: query,
                    user_context: {
                        user_name: userName,
                        lesson_context: lessonTitle,
                        role: "Learner"
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('AI Engine not reachable. Ensure Central Intelligence is running on port 8001.');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('AI Error:', err);
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { askVera, isLoading, error };
};
