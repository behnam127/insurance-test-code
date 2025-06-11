import { useEffect } from 'react';

interface StoredFormData {
    data: any;
    timestamp: number;
}

const EXPIRATION_TIME = 60 * 60 * 1000

export const useFormPersistence = (formId: string, formData: any, isSubmitted: boolean) => {
    useEffect(() => {

        if (isSubmitted) {
            localStorage.removeItem(`form_${formId}`);
            return;
        }

        const dataToStore: StoredFormData = {
            data: formData,
            timestamp: Date.now(),
        };
        localStorage.setItem(`form_${formId}`, JSON.stringify(dataToStore));
    }, [formData, formId, isSubmitted]);
};

export const getStoredFormData = (formId: string): any | null => {
    const storedData = localStorage.getItem(`form_${formId}`);

    if (!storedData) {
        return null;
    }

    try {
        const parsedData: StoredFormData = JSON.parse(storedData);
        const now = Date.now();


        if (now - parsedData.timestamp > EXPIRATION_TIME) {
            localStorage.removeItem(`form_${formId}`);
            return null;
        }

        return parsedData.data;
    } catch (error) {
        console.error('Error parsing stored form data:', error);
        return null;
    }
}; 