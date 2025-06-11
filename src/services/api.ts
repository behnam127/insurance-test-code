import axios from 'axios';

const BASE_URL = 'https://assignment.devotel.io';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export type FormStructure = {
    formId: string;
    type: string;
    title: string;
    fields: FormField[];
};

export type FormField = {
    id: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'group';
    label: string;
    required?: boolean;
    options?: string[];
    fields?: FormField[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
    visibility?: {
        dependsOn: string;
        condition: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
        value: any;
    };
    dynamicOptions?: {
        endpoint: string;
        method: 'GET' | 'POST';
        dependsOn: string;
    };
};

export type FormSubmission = {
    id: string;
};

export type ListViewResponse = {
    columns: string[];
    data: any[];
};

export const insuranceApi = {
    getFormStructure: async (): Promise<FormStructure[]> => {
        const response = await api.get('/api/insurance/forms');
        const forms = response.data;

        forms.forEach((form: FormStructure) => {
            if (form.formId === 'home_insurance_application') {

                const securitySystemType = form.fields.find(f => f.id === 'security_system_type');
                if (securitySystemType) {
                    securitySystemType.visibility = {
                        dependsOn: 'has_security_system',
                        condition: 'equals',
                        value: 'Yes'
                    };
                }
            } else if (form.formId === 'car_insurance_application') {

                const accidentCount = form.fields.find(f => f.id === 'accident_count');
                if (accidentCount) {
                    accidentCount.visibility = {
                        dependsOn: 'accidents_last_5_years',
                        condition: 'equals',
                        value: 'Yes'
                    };
                }
            } else if (form.formId === 'health_insurance_application') {

                const healthInfo = form.fields.find(f => f.id === 'health_info');
                if (healthInfo && healthInfo.fields) {

                    const hasGenderField = healthInfo.fields.some(f => f.id === 'gender');
                    if (!hasGenderField) {

                        healthInfo.fields.unshift({
                            id: 'gender',
                            type: 'radio',
                            label: 'Gender',
                            required: true,
                            options: ['Male', 'Female']
                        });


                        healthInfo.fields.push({
                            id: 'pregnancy_status',
                            type: 'radio',
                            label: 'Pregnancy Status',
                            required: true,
                            options: ['Yes', 'No'],
                            visibility: {
                                dependsOn: 'gender',
                                condition: 'equals',
                                value: 'Female'
                            }
                        });
                    }
                }
            }

            form.fields.forEach((field) => {
                if (field.type === 'group' && field.fields) {
                    field.fields = field.fields.filter(f => f.id !== 'state');
                }
            });
        });

        return forms;
    },

    submitForm: async (data: any): Promise<FormSubmission> => {
        const response = await api.post('/api/insurance/forms/submit', data);
        return response.data;
    },

    getSubmissions: async (): Promise<ListViewResponse> => {
        const response = await api.get('/api/insurance/forms/submissions');
        return response.data;
    },
};

export default api; 