import { useEffect } from 'react';

interface StoredFormData {
    data: any;
    timestamp: number;
}

const EXPIRATION_TIME = 60 * 60 * 1000

export const useFormPersistence = (formId: string, formData: any, isSubmitted: boolean) => {
    useEffect(() => {
        console.log('useFormPersistence effect triggered:', { formId, formData, isSubmitted });

        if (isSubmitted) {
            console.log('Form submitted, removing stored data');
            localStorage.removeItem(`form_${formId}`);
            return;
        }

        const dataToStore: StoredFormData = {
            data: formData,
            timestamp: Date.now(),
        };
        console.log('Storing form data:', dataToStore);
        localStorage.setItem(`form_${formId}`, JSON.stringify(dataToStore));
    }, [formData, formId, isSubmitted]);
};

export const getStoredFormData = (formId: string): any | null => {
    console.log('Getting stored form data for:', formId);
    const storedData = localStorage.getItem(`form_${formId}`);
    console.log('Raw stored data:', storedData);

    if (!storedData) {
        console.log('No stored data found');
        return null;
    }

    try {
        const parsedData: StoredFormData = JSON.parse(storedData);
        const now = Date.now();
        console.log('Parsed data:', parsedData);
        console.log('Time difference:', now - parsedData.timestamp);

        if (now - parsedData.timestamp > EXPIRATION_TIME) {
            console.log('Data has expired, removing from storage');
            localStorage.removeItem(`form_${formId}`);
            return null;
        }

        console.log('Returning valid stored data');
        return parsedData.data;
    } catch (error) {
        console.error('Error parsing stored form data:', error);
        return null;
    }
}; 