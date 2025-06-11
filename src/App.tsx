import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery,useQueryClient } from '@tanstack/react-query'
import { Container, Box, Tab, Tabs, Alert, Snackbar, CssBaseline, Skeleton } from '@mui/material'
import { insuranceApi } from './services/api'
import type { FormStructure, ListViewResponse } from './services/api'
import DynamicForm from './components/DynamicForm'
import SubmissionsList from './components/SubmissionsList'
import Header from './components/Header'
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext'
import './App.css'

const queryClient = new QueryClient()

function AppContent() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedForm, setSelectedForm] = useState<FormStructure | null>(null)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { isDarkMode, toggleTheme } = useThemeContext()

  const queryClient = useQueryClient();

  const { data: forms } = useQuery({
    queryKey: ['forms'],
    queryFn: insuranceApi.getFormStructure,
  })

  const { data: submissions } = useQuery({
    queryKey: ['submissions'],
    queryFn: insuranceApi.getSubmissions,
  })
  

  const handleFormSubmit = async (data: any) => {
    setNotification({
      message: 'Submitting started!',
      type: 'success',
    });
    try {
      await insuranceApi.submitForm(data);
      await queryClient.invalidateQueries({ queryKey: ['submissions'] }); 
      setNotification({
        message: 'Application submitted successfully!',
        type: 'success',
      });
    } catch (error) {
      setNotification({
        message: 'Error submitting application. Please try again.',
        type: 'error',
      });
      console.error('Error submitting application:', error);
    }
  };

  const handleColumnToggle = (column: string) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    )
  }

  return (
    <>
      <CssBaseline />
      <Header isDarkMode={isDarkMode} onThemeChange={toggleTheme} />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="New Application" />
            <Tab label="View Applications" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              {!forms ? (
                <>
                  <Skeleton variant="text" width={200} height={40} key="skeleton-title" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={`skeleton-${i}`} variant="rectangular" width="100%" height={i === 2 ? 120 : 40} sx={{ my: 2 }} />
                  ))}
                </>
              ) : (
                <>
                  {forms.map((form: FormStructure) => (
                    <Box
                      key={form.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedForm(form)}
                    >
                      {form.type} {form.title}
                    </Box>
                  ))}
                  {selectedForm && (
                    <DynamicForm
                      onSubmit={handleFormSubmit}
                      formStructure={selectedForm}
                    />
                  )}
                </>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {!submissions ? (
                <>
                  <Skeleton variant="text" width={200} height={40} key="skeleton-sub-title" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={`skeleton-sub-${i}`} variant="rectangular" width="100%" height={100} sx={{ my: 2 }} />
                  ))}
                </>
              ) : (
                <SubmissionsList
                  data={submissions}
                  onColumnToggle={handleColumnToggle}
                />
              )}
            </Box>
          )}
        </Box>

        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
        >
          <Alert
            onClose={() => setNotification(null)}
            severity={notification?.type}
            sx={{ width: '100%' }}
          >
            {notification?.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
