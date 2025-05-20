import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// Remove these imports
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// And replace them with:
import { TextareaAutosize } from '@mui/material';

const Popups = () => {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPopup, setSelectedPopup] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    active: true,
    type: 'info',
    button_text: '',
    button_link: '',
    display_order: 0,
    duration_days: 7,
    start_date: '',
    end_date: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        enqueueSnackbar('Authentication token not found. Please log in again.', { variant: 'error' });
        navigate('/login');
        return;
      }
      
      // Use the correct API endpoint - make sure this matches your backend route
      const response = await axios.get('http://localhost:5000/api/popups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPopups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching popups:', error);
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch popups';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      setLoading(false);
    }
  };

  const handleOpenDialog = (popup = null) => {
    if (popup) {
      setSelectedPopup(popup);
      setFormData({
        title: popup.title,
        content: popup.content,
        active: popup.active,
        type: popup.type,
        button_text: popup.button_text || '',
        button_link: popup.button_link || '',
        display_order: popup.display_order,
        duration_days: popup.duration_days,
        start_date: popup.start_date || '',
        end_date: popup.end_date || '',
        image: null
      });
      
      if (popup.image_url) {
        setPreviewImage(popup.image_url.startsWith('http') 
          ? popup.image_url 
          : `http://localhost:5000${popup.image_url}`);
      } else {
        setPreviewImage('');
      }
    } else {
      setSelectedPopup(null);
      setFormData({
        title: '',
        content: '',
        active: true,
        type: 'info',
        button_text: '',
        button_link: '',
        display_order: 0,
        duration_days: 7,
        start_date: '',
        end_date: '',
        image: null
      });
      setPreviewImage('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPopup(null);
  };

  const handleOpenDeleteDialog = (popup) => {
    setSelectedPopup(popup);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPopup(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else if (key !== 'image') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (selectedPopup) {
        // Update existing popup
        await axios.put(`http://localhost:5000/api/popups/${selectedPopup.id}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        enqueueSnackbar('Popup updated successfully', { variant: 'success' });
      } else {
        // Create new popup
        await axios.post('http://localhost:5000/api/popups', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        enqueueSnackbar('Popup created successfully', { variant: 'success' });
      }
      
      handleCloseDialog();
      fetchPopups();
    } catch (error) {
      console.error('Error saving popup:', error);
      enqueueSnackbar('Failed to save popup', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/popups/${selectedPopup.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      enqueueSnackbar('Popup deleted successfully', { variant: 'success' });
      handleCloseDeleteDialog();
      fetchPopups();
    } catch (error) {
      console.error('Error deleting popup:', error);
      enqueueSnackbar('Failed to delete popup', { variant: 'error' });
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Popups</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Popup
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Display Order</TableCell>
              <TableCell>Duration (days)</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {popups.map((popup) => (
              <TableRow key={popup.id}>
                <TableCell>{popup.title}</TableCell>
                <TableCell>{popup.type}</TableCell>
                <TableCell>{popup.active ? 'Yes' : 'No'}</TableCell>
                <TableCell>{popup.display_order}</TableCell>
                <TableCell>{popup.duration_days}</TableCell>
                <TableCell>{popup.start_date || 'N/A'}</TableCell>
                <TableCell>{popup.end_date || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(popup)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDeleteDialog(popup)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {popups.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No popups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Popup Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedPopup ? 'Edit Popup' : 'Add Popup'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="title"
                  label="Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Type"
                  >
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="display_order"
                  label="Display Order"
                  type="number"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="duration_days"
                  label="Duration (days)"
                  type="number"
                  value={formData.duration_days}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="start_date"
                  label="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="end_date"
                  label="End Date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="button_text"
                  label="Button Text"
                  value={formData.button_text}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="button_link"
                  label="Button Link"
                  value={formData.button_link}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Content</Typography>
                <TextareaAutosize
                  name="content"
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  minRows={8}
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="Enter popup content here..."
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Image</Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginBottom: '10px' }}
                />
                {previewImage && (
                  <Box mt={2} textAlign="center">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedPopup ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this popup?
            This action is irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Popups;