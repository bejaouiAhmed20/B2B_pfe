import { Request, Response } from 'express';
import { Popup } from '../../models/Popup';

// Get all popups
export const getPopups = async (req: Request, res: Response) => {
  try {
    const popups = await Popup.find({
      order: { display_order: 'ASC', created_at: 'DESC' }
    });
    res.json(popups);
  } catch (error) {
    console.error('Error fetching popups:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des popups' });
  }
};

// Get active popups only
export const getActivePopups = async (req: Request, res: Response) => {
  try {
    const popups = await Popup.find({
      where: { active: true },
      order: { display_order: 'ASC', created_at: 'DESC' }
    });
    res.json(popups);
  } catch (error) {
    console.error('Error fetching active popups:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des popups actifs' });
  }
};

// Get popup by ID
export const getPopupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const popupId = parseInt(id, 10);

    if (isNaN(popupId)) {
      return res.status(400).json({ error: 'ID de popup invalide' });
    }

    const popup = await Popup.findOne({ where: { id: popupId } });

    if (!popup) {
      return res.status(404).json({ error: 'Popup non trouvé' });
    }

    res.json(popup);
  } catch (error) {
    console.error('Error fetching popup:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du popup' });
  }
};

// Create new popup
export const createPopup = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      active = true,
      image_url,
      type = 'info',
      button_text,
      button_link,
      display_order = 0,
      start_date,
      end_date
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Le titre et le contenu sont requis' });
    }

    const popup = new Popup();
    popup.title = title;
    popup.content = content;
    popup.active = active;
    popup.image_url = image_url;
    popup.type = type;
    popup.button_text = button_text;
    popup.button_link = button_link;
    popup.display_order = display_order;
    popup.start_date = start_date || null;
    popup.end_date = end_date || null;

    const savedPopup = await popup.save();
    res.status(201).json(savedPopup);
  } catch (error) {
    console.error('Error creating popup:', error);
    res.status(500).json({ error: 'Erreur lors de la création du popup' });
  }
};

// Update popup
export const updatePopup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const popupId = parseInt(id, 10);

    if (isNaN(popupId)) {
      return res.status(400).json({ error: 'ID de popup invalide' });
    }

    const {
      title,
      content,
      active,
      image_url,
      type,
      button_text,
      button_link,
      display_order,
      start_date,
      end_date
    } = req.body;

    const popup = await Popup.findOne({ where: { id: popupId } });

    if (!popup) {
      return res.status(404).json({ error: 'Popup non trouvé' });
    }

    // Update fields
    if (title !== undefined) popup.title = title;
    if (content !== undefined) popup.content = content;
    if (active !== undefined) popup.active = active;
    if (image_url !== undefined) popup.image_url = image_url;
    if (type !== undefined) popup.type = type;
    if (button_text !== undefined) popup.button_text = button_text;
    if (button_link !== undefined) popup.button_link = button_link;
    if (display_order !== undefined) popup.display_order = display_order;
    if (start_date !== undefined) popup.start_date = start_date || null;
    if (end_date !== undefined) popup.end_date = end_date || null;

    const updatedPopup = await popup.save();
    res.json(updatedPopup);
  } catch (error) {
    console.error('Error updating popup:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du popup' });
  }
};

// Delete popup
export const deletePopup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const popupId = parseInt(id, 10);

    if (isNaN(popupId)) {
      return res.status(400).json({ error: 'ID de popup invalide' });
    }

    const popup = await Popup.findOne({ where: { id: popupId } });

    if (!popup) {
      return res.status(404).json({ error: 'Popup non trouvé' });
    }

    await popup.remove();
    res.json({ message: 'Popup supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting popup:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du popup' });
  }
};

// Toggle popup status
export const togglePopupStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const popupId = parseInt(id, 10);

    if (isNaN(popupId)) {
      return res.status(400).json({ error: 'ID de popup invalide' });
    }

    const popup = await Popup.findOne({ where: { id: popupId } });

    if (!popup) {
      return res.status(404).json({ error: 'Popup non trouvé' });
    }

    popup.active = !popup.active;
    const updatedPopup = await popup.save();

    res.json(updatedPopup);
  } catch (error) {
    console.error('Error toggling popup status:', error);
    res.status(500).json({ error: 'Erreur lors du changement de statut du popup' });
  }
};
