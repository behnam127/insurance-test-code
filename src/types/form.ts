export type FormFieldType = 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'group';

export interface Validation {
    min?: number;
    max?: number;
    pattern?: string;
}

export interface Visibility {
    dependsOn: string;
    condition: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    value: any;
}

export interface DynamicOptions {
    dependsOn: string;
    endpoint: string;
    method: 'GET' | 'POST';
}

export interface FormField {
    id: string;
    label: string;
    type: FormFieldType;
    required?: boolean;
    helperText?: string;
    options?: string[];
    validation?: Validation;
    visibility?: Visibility;
    dynamicOptions?: DynamicOptions;
    fields?: FormField[];
}

export interface FormStructure {
    formId: string;
    title: string;
    description?: string;
    fields: FormField[];
} 