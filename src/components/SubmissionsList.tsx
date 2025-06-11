import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import type { ListViewResponse } from '../services/api';

interface SubmissionsListProps {
  data: ListViewResponse;
  onColumnToggle: (column: string) => void;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({ data, onColumnToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [activeColumnSet, setActiveColumnSet] = useState<Set<string>>(new Set(data.columns));

  const handleSort = (column: string) => {
    setSortConfig((current) => ({
      key: column,
      direction:
        current?.key === column && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleColumnToggle = (column: string) => {
    const newSet = new Set(activeColumnSet);
    if (newSet.has(column)) {
      newSet.delete(column);
    } else {
      newSet.add(column);
    }
    setActiveColumnSet(newSet);
    onColumnToggle(column);
  };

  const visibleColumns = data.columns.filter((col) => activeColumnSet.has(col));

  const filteredData = data.data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Insurance Applications
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle1" gutterBottom>
          Visible Columns:
        </Typography>
        {data.columns.map((column) => (
          <FormControlLabel
            key={column}
            control={
              <Checkbox
                checked={activeColumnSet.has(column)}
                onChange={() => handleColumnToggle(column)}
              />
            }
            label={column}
          />
        ))}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableCell key={column}>
                  <TableSortLabel
                    active={sortConfig?.key === column}
                    direction={sortConfig?.key === column ? sortConfig.direction : 'asc'}
                    onClick={() => handleSort(column)}
                  >
                    {column}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow key={row.id}>
                {visibleColumns.map((column) => (
                  <TableCell key={`${row.id}-${column}`}>
                    {row[column]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SubmissionsList;