import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, newsItem: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/news');
      setNews(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des actualités', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (newsItem) => {
    setEditDialog({ open: true, newsItem });
    setFormData({
      titre: newsItem.titre,
      contenu: newsItem.contenu,
      image: null
    });
    setPreviewImage(newsItem.image_url ? `http://localhost:5000${newsItem.image_url}` : '');
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, newsItem: null });
    setFormData({
      titre: '',
      contenu: '',
      image: null
    });
    setPreviewImage('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('contenu', formData.contenu);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.put(
        `http://localhost:5000/api/news/${editDialog.newsItem.id}`, 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      showSnackbar('Actualité modifiée avec succès');
      handleEditClose();
      fetchNews();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/news/${id}`);
        showSnackbar('Actualité supprimée avec succès');
        fetchNews();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Actualités
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/news/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter une Actualité
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Contenu</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image_url ? (
                      <img 
                        src={`http://localhost:5000${item.image_url}`} 
                        alt={item.titre} 
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    ) : (
                      'Aucune image'
                    )}
                  </TableCell>
                  <TableCell>{item.titre}</TableCell>
                  <TableCell>{item.contenu.length > 100 ? `${item.contenu.substring(0, 100)}...` : item.contenu}</TableCell>
                  <TableCell>{formatDate(item.date_creation)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditOpen(item)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={news.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
        }
      />

      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Modifier l'Actualité</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <TextField
              name="titre"
              label="Titre"
              value={formData.titre}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="contenu"
              label="Contenu"
              value={formData.contenu}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              multiline
              rows={4}
            />
            <div style={{ marginTop: 16 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span">
                  Changer l'image
                </Button>
              </label>
            </div>
            {previewImage && (
              <div style={{ marginTop: 16 }}>
                <Typography variant="subtitle1">Aperçu de l'image:</Typography>
                <img 
                  src={previewImage} 
                  alt="Aperçu" 
                  style={{ maxWidth: '100%', maxHeight: 200, marginTop: 8 }}
                />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Annuler</Button>
            <Button 
              type="submit" 
              variant="contained" 
              style={{ backgroundColor: '#CC0A2B' }}
            >
              Modifier
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default News;