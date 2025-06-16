import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  useTheme,
  CssBaseline,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import DownloadIcon from '@mui/icons-material/Download';
import { ThemeProvider } from '@mui/material/styles';

const API_BASE_URL = 'http://localhost:5000/api';

const SLIDE_SECTIONS = [
  { key: 'cover', label: 'Cover Slide (Startup Name & Tagline)' },
  { key: 'problem', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'market', label: 'Market Size (TAM/SAM/SOM)' },
  { key: 'product', label: 'Product/Technology Overview' },
  { key: 'business_model', label: 'Business Model' },
  { key: 'competition', label: 'Competitive Advantage' },
  { key: 'team', label: 'Team' },
  { key: 'traction', label: 'Traction / Milestones' },
  { key: 'funding_needs', label: 'Ask (Funding, Hiring, Next Steps)' },
];

function App() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    startup_name: '',
    problem: '',
    solution: '',
    target_audience: '',
    industry: '',
    revenue_model: '',
    stage: '',
    team: '',
    vision: '',
    USP: '',
    competition: '',
  });

  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regeneratingSlide, setRegeneratingSlide] = useState(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateDeck = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/generate-full-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate pitch deck');
        setSnackbar({
          open: true,
          message: errorData.error || 'Failed to generate pitch deck',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      const data = await response.json();
      setDeck(data);
      setSnackbar({
        open: true,
        message: 'Pitch deck generated successfully!',
        severity: 'success'
      });
    } catch (err) {
      setError(err.message || 'Failed to generate pitch deck');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to generate pitch deck',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateSlide = async (section) => {
    setRegeneratingSlide(section);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-slide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          context: formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to regenerate ${section} slide`);
      }
      const data = await response.json();
      setDeck(prev => ({
        ...prev,
        [section]: data.content
      }));
      setSnackbar({
        open: true,
        message: `${section} slide regenerated successfully!`,
        severity: 'success'
      });
    } catch (err) {
      setError(err.message || `Failed to regenerate ${section} slide`);
      setSnackbar({
        open: true,
        message: err.message || `Failed to regenerate ${section} slide`,
        severity: 'error'
      });
    } finally {
      setRegeneratingSlide(null);
    }
  };

  const handleExportJSON = () => {
    setJsonDialogOpen(true);
    setSnackbar({
      open: true,
      message: 'JSON content ready for export.',
      severity: 'info'
    });
  };

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(deck, null, 2);
    navigator.clipboard.writeText(jsonString);
    setSnackbar({
      open: true,
      message: 'JSON copied to clipboard!',
      severity: 'success'
    });
  };

  const handleGeneratePPT = async () => {
    if (!deck || !formData.startup_name) {
      setSnackbar({
        open: true,
        message: 'Please generate a pitch deck and ensure startup name is filled first.',
        severity: 'warning'
      });
      return;
    }

    setIsGeneratingPPT(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          deck: deck
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PowerPoint');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.startup_name.replace(/\s+/g, '_')}_pitch_deck.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSnackbar({
        open: true,
        message: 'PowerPoint presentation downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to generate PowerPoint presentation',
        severity: 'error'
      });
    } finally {
      setIsGeneratingPPT(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Top Bar/Header */}
      <Box sx={{
        width: '100%',
        py: 2,
        px: 4,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        textAlign: 'center',
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.text.white }}>
          AI Pitch Deck Generator
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 64px)', justifyContent: 'center' }}>
        {error && <Alert severity="error" sx={{ mb: 3, width: '100%' }}>{error}</Alert>}

        {!deck ? (
          <Paper elevation={6} sx={{
            p: { xs: 3, md: 6 }, // Responsive padding
            borderRadius: '16px', // rounded-2xl
            boxShadow: theme.customShadows.card || theme.shadows[5], // Use custom shadow if defined
            backgroundColor: theme.palette.background.paper,
            width: '100%',
            maxWidth: '600px',
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <Typography variant="h5" component="h2" align="center" gutterBottom sx={{ color: theme.palette.text.white, mb: 4 }}>
              Generate Your Pitch Deck
            </Typography>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleGenerateDeck(); }} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3, 
                width: '100%',
              }}
            >
              <TextField
                label="Startup Name *"
                name="startup_name"
                value={formData.startup_name}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Problem *"
                name="problem"
                value={formData.problem}
                onChange={handleInputChange}
                required
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />
              <TextField
                label="Solution *"
                name="solution"
                value={formData.solution}
                onChange={handleInputChange}
                required
                fullWidth
                multiline
                rows={3}
                variant="outlined"
              />
              <TextField
                label="Target Audience"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Revenue Model"
                name="revenue_model"
                value={formData.revenue_model}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Stage of Startup (e.g., Seed, Series A)"
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Team (brief description of key members)"
                name="team"
                value={formData.team}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
              <TextField
                label="Vision / Long-term Goal"
                name="vision"
                value={formData.vision}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
              <TextField
                label="Unique Selling Proposition (USP)"
                name="USP"
                value={formData.USP}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
              <TextField
                label="Competition (who are they, what do they do?)"
                name="competition"
                value={formData.competition}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Pitch Deck'}
              </Button>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={6} sx={{
            p: { xs: 3, md: 6 }, // Responsive padding
            mb: 4,
            borderRadius: '16px',
            boxShadow: theme.customShadows.card || theme.shadows[5],
            backgroundColor: theme.palette.background.paper,
            width: '100%',
            maxWidth: '800px',
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: theme.palette.text.white, mb: 3 }}>
              Generated Pitch Deck Overview
            </Typography>
            <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 2 }}>
              {SLIDE_SECTIONS.map((section) => (
                <Box key={section.key} sx={{
                  mb: 4,
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  backgroundColor: theme.palette.background.default,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { boxShadow: theme.shadows[3] }
                }}>
                  <Typography variant="h6" sx={{ color: theme.palette.primary.light, mb: 1.5 }}>
                    {section.label}
                    {regeneratingSlide === section.key && <CircularProgress size={20} sx={{ ml: 2 }} />}
                  </Typography>
                  <ReactMarkdown>{deck[section.key] || 'No content generated for this section yet.'}</ReactMarkdown>
                  <Button 
                    variant="outlined" 
                    color="primary" // Changed to primary outlined for consistency
                    onClick={() => regenerateSlide(section.key)} 
                    disabled={regeneratingSlide === section.key}
                    sx={{ mt: 2, mr: 1 }}
                  >
                    Regenerate
                  </Button>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ContentCopyIcon />}
                onClick={handleExportJSON}
                sx={{ py: 1.5 }}
              >
                Export JSON
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleGeneratePPT}
                disabled={isGeneratingPPT}
                sx={{ py: 1.5 }}
              >
                {isGeneratingPPT ? <CircularProgress size={24} color="inherit" /> : 'Download PowerPoint'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setDeck(null)} // Function to go back to input form
                sx={{ py: 1.5 }}
              >
                Back to Input Form
              </Button>
            </Box>
          </Paper>
        )}

        <Dialog open={jsonDialogOpen} onClose={() => setJsonDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.white, borderBottom: `1px solid ${theme.palette.divider}` }}>
            Pitch Deck JSON Data
            <IconButton
              aria-label="close"
              onClick={() => setJsonDialogOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.text.secondary,
              }}
            >
              x
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ backgroundColor: theme.palette.background.default, p: 3 }}>
            <pre style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word', 
                color: theme.palette.text.primary, 
                backgroundColor: theme.palette.background.paper, 
                padding: '15px', 
                borderRadius: '8px',
                maxHeight: '60vh',
                overflowY: 'auto',
              }}>
              {JSON.stringify(deck, null, 2)}
            </pre>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
            <Button onClick={handleCopyJson} color="primary" variant="contained" startIcon={<ContentCopyIcon />}>
              Copy to Clipboard
            </Button>
            <Button onClick={() => setJsonDialogOpen(false)} color="primary" variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App; 