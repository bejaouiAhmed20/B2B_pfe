import { Request, Response } from 'express';
import { Popup } from '../../models/Popup';

// Get all popups
export const getPopups = async (req: Request, res: Response) => {
  try {
    const popups = await Popup.find({
      order: {
        display_order: 'ASC',
        created_at: 'DESC'
      }
    });
    res.json(popups);
  } catch (error) {
    console.error('Error fetching popups:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des popups" });
  }
};

// Get active popups (for client display)
export const getActivePopups = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Find popups that are active and within date range
    const popups = await Popup.find({
      where: {
        active: true
      },
      order: {
        display_order: 'ASC'
      }
    });

    // Filter popups by date range if specified
    const filteredPopups = popups.filter(popup => {
      // If no date range is specified, always include
      if (!popup.start_date && !popup.end_date) {
        return true;
      }

      // Check start date if specified
      if (popup.start_date && popup.start_date > currentDate) {
        return false;
      }

      // Check end date if specified
      if (popup.end_date && popup.end_date < currentDate) {
        return false;
      }

      return true;
    });

    res.json(filteredPopups);
  } catch (error) {
    console.error('Error fetching active popups:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des popups actifs" });
  }
};

// Get popup by ID
export const getPopupById = async (req: Request, res: Response) => {
  try {
    const popup = await Popup.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!popup) {
      return res.status(404).json({ message: "Popup non trouvé" });
    }

    res.json(popup);
  } catch (error) {
    console.error('Error fetching popup by ID:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la récupération du popup" });
  }
};

// Create a new popup
export const createPopup = async (req: Request, res: Response) => {
  try {
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

    const popup = Popup.create({
      title,
      content,
      active: active !== undefined ? active : true,
      image_url,
      type: type || 'info',
      button_text,
      button_link,
      display_order: display_order || 0,
      start_date,
      end_date
    });

    await popup.save();

    res.status(201).json(popup);
  } catch (error) {
    console.error('Error creating popup:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la création du popup" });
  }
};

// Update an existing popup
export const updatePopup = async (req: Request, res: Response) => {
  try {
    const popupId = parseInt(req.params.id);
    const popup = await Popup.findOne({
      where: { id: popupId }
    });

    if (!popup) {
      return res.status(404).json({ message: "Popup non trouvé" });
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

    // Update fields if provided
    if (title !== undefined) popup.title = title;
    if (content !== undefined) popup.content = content;
    if (active !== undefined) popup.active = active;
    if (image_url !== undefined) popup.image_url = image_url;
    if (type !== undefined) popup.type = type;
    if (button_text !== undefined) popup.button_text = button_text;
    if (button_link !== undefined) popup.button_link = button_link;
    if (display_order !== undefined) popup.display_order = display_order;
    if (start_date !== undefined) popup.start_date = start_date;
    if (end_date !== undefined) popup.end_date = end_date;

    await popup.save();

    res.json(popup);
  } catch (error) {
    console.error('Error updating popup:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la mise à jour du popup" });
  }
};

// Delete a popup
export const deletePopup = async (req: Request, res: Response) => {
  try {
    const popupId = parseInt(req.params.id);
    const popup = await Popup.findOne({
      where: { id: popupId }
    });

    if (!popup) {
      return res.status(404).json({ message: "Popup non trouvé" });
    }

    await popup.remove();

    res.json({ message: "Popup supprimé avec succès" });
  } catch (error) {
    console.error('Error deleting popup:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la suppression du popup" });
  }
};

// Toggle popup active status
export const togglePopupStatus = async (req: Request, res: Response) => {
  try {
    const popupId = parseInt(req.params.id);
    const popup = await Popup.findOne({
      where: { id: popupId }
    });

    if (!popup) {
      return res.status(404).json({ message: "Popup non trouvé" });
    }

    popup.active = !popup.active;
    await popup.save();

    res.json({
      message: popup.active ? "Popup activé" : "Popup désactivé",
      active: popup.active
    });
  } catch (error) {
    console.error('Error toggling popup status:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors du changement de statut du popup" });
  }
};
