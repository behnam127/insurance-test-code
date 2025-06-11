import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import type { FormField, FormStructure } from '../types/form';
import axios from 'axios';
import { useFormPersistence, getStoredFormData } from '../hooks/useFormPersistence';

interface DynamicFormProps {
  formStructure: FormStructure;
  onSubmit: (data: any) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formStructure, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {

    const storedData = getStoredFormData(formStructure.formId);
    if (storedData) {
      return storedData;
    }


    const initialData: Record<string, any> = {};
    const initializeField = (field: FormField) => {
      if (field.type === 'group' && field.fields) {
        field.fields.forEach(initializeField);
      } else {
        initialData[field.id] = '';
      }
    };
    formStructure.fields.forEach(initializeField);
    return initialData;
  });

  const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const previousFormData = useRef<Record<string, any>>(formData);

  useEffect(() => {
    previousFormData.current = formData;
  }, [formData]);

  useFormPersistence(formStructure.formId, formData, isSubmitted);

  const handleChange = async (fieldId: string, value: any) => {
    const newData = { ...formData, [fieldId]: value };
    
    const updateDependentFields = (fields: FormField[]) => {
      fields.forEach((field) => {
        if (field.type === 'group' && field.fields) {
          updateDependentFields(field.fields);
        }
        if (field.dynamicOptions?.dependsOn === fieldId) {
          newData[field.id] = '';
          fetchDynamicOptions(field, newData);
        }
      });
    };
    
    updateDependentFields(formStructure.fields);
    setFormData(newData);
  };

  const fetchDynamicOptions = async (field: FormField, currentData: Record<string, any>) => {
    if (field.dynamicOptions) {
      try {
        setLoading((prev) => ({ ...prev, [field.id]: true }));
        const response = await axios({
          method: field.dynamicOptions.method,
          url: field.dynamicOptions.endpoint,
          params: { value: currentData[field.dynamicOptions.dependsOn] },
        });

        const options = Array.isArray(response.data) ? response.data : [];
        setDynamicOptions((prev) => ({
          ...prev,
          [field.id]: options,
        }));
      } catch (error) {
        console.error('Error fetching dynamic options:', error);

        setDynamicOptions((prev) => ({
          ...prev,
          [field.id]: [],
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [field.id]: false }));
      }
    }
  };

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.visibility) return true;
    
    const { dependsOn, condition, value } = field.visibility;
    const dependentValue = formData[dependsOn];
    
    switch (condition) {
      case 'equals':
        return dependentValue === value;
      case 'notEquals':
        return dependentValue !== value;
      case 'greaterThan':
        return dependentValue > value;
      case 'lessThan':
        return dependentValue < value;
      default:
        return true;
    }
  };

  const showError = (field: FormField): boolean => {
    if (!isSubmitted) return false;
    if (!field.required) return false;
    return !formData[field.id];
  };

  const getOptions = (field: FormField): string[] => {
    if (field.dynamicOptions) {
      return Array.isArray(dynamicOptions[field.id]) ? dynamicOptions[field.id] : [];
    }
    return Array.isArray(field.options) ? field.options : [];
  };

  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const renderFieldContent = () => {
      switch (field.type) {
        case 'text':
          return (
            <TextField
              fullWidth
              label={field.label}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              error={showError(field)}
              helperText={showError(field) ? 'This field is required' : ''}
            />
          );

        case 'number':
          return (
            <TextField
              fullWidth
              type="number"
              label={field.label}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              inputProps={{
                min: field.validation?.min,
                max: field.validation?.max,
              }}
              error={showError(field)}
              helperText={showError(field) ? 'This field is required' : ''}
            />
          );

        case 'select':
          return (
            <FormControl fullWidth required={field.required} error={showError(field)}>
              <InputLabel>{field.label}</InputLabel>
              <Select
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                label={field.label}
                disabled={loading[field.id]}
              >
                {getOptions(field).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {loading[field.id] && (
                <Typography variant="caption" color="textSecondary">
                  Loading options...
                </Typography>
              )}
              {showError(field) && (
                <Typography variant="caption" color="error">
                  This field is required
                </Typography>
              )}
            </FormControl>
          );

        case 'radio':
          return (
            <FormControl className='items-start' component="fieldset" required={field.required} error={showError(field)}>
              <Typography variant="subtitle1">{field.label}</Typography>
              <RadioGroup
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
              >
                {getOptions(field).map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
              {showError(field) && (
                <Typography variant="caption" color="error">
                  This field is required
                </Typography>
              )}
            </FormControl>
          );

        case 'checkbox':
          return (
            <FormControl component="fieldset" required={field.required} error={showError(field)}>
              <Typography variant="subtitle1">{field.label}</Typography>
              <FormGroup>
                {getOptions(field).map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={formData[field.id]?.includes(option) || false}
                        onChange={(e) => {
                          const currentValues = formData[field.id] || [];
                          const newValues = e.target.checked
                            ? [...currentValues, option]
                            : currentValues.filter((v: string) => v !== option);
                          handleChange(field.id, newValues);
                        }}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
              {showError(field) && (
                <Typography variant="caption" color="error">
                  This field is required
                </Typography>
              )}
            </FormControl>
          );

        case 'date':
          return (
            <TextField
              fullWidth
              type="date"
              label={field.label}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
              InputLabelProps={{ shrink: true }}
              error={showError(field)}
              helperText={showError(field) ? 'This field is required' : ''}
            />
          );

        case 'group':
          return (
            <>
              <Typography variant="h6" gutterBottom>
                {field.label}
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {field.fields?.map((subField) => (
                  <Box key={subField.id}>
                    {renderField(subField)}
                  </Box>
                ))}
              </Box>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <Paper elevation={1} sx={{ p: 2 }}>
        {renderFieldContent()}
      </Paper>
    );
  };

  const hasErrors = (fields: FormField[]): boolean => {
    return fields.some((field) => {
      if (!isFieldVisible(field)) return false;
      if (field.type === 'group' && field.fields) {
        return hasErrors(field.fields);
      }
      return field.required && !formData[field.id];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    const hasErr = hasErrors(formStructure.fields);

    if (!hasErr) {
      onSubmit(formData);
      
      const initialData: Record<string, any> = {};
      const initializeField = (field: FormField) => {
        if (field.type === 'group' && field.fields) {
          field.fields.forEach(initializeField);
        } else {
          initialData[field.id] = '';
        }
      };
      formStructure.fields.forEach(initializeField);
      setFormData(initialData);
      setIsSubmitted(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        {formStructure.title}
      </Typography>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {formStructure.fields.map((field) => (
          <Box key={field.id}>
            {renderField(field)}
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Submit Application
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DynamicForm; 