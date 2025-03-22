import { Request, Response } from 'express';
import { Reclamation } from '../../models/Reclamation';
import { User } from '../../models/User';

// Get all reclamations
export const getReclamations = async (req: Request, res: Response) => {
  try {
    const reclamations = await Reclamation.find({
      relations: ['user'],
      order: {
        date_creation: 'DESC'
      }
    });
    res.json(reclamations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Get reclamation by ID
export const getReclamationById = async (req: Request, res: Response) => {
  try {
    const reclamation = await Reclamation.findOne({
      where: { id: req.params.id },
      relations: ['user']
    });

    if (!reclamation) {
      return res.status(404).json({ message: "Réclamation non trouvée" });
    }

    res.json(reclamation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Get reclamations by user ID
export const getReclamationsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const reclamations = await Reclamation.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: {
        date_creation: 'DESC'
      }
    });
    
    res.json(reclamations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Create a new reclamation
export const createReclamation = async (req: Request, res: Response) => {
  try {
    const { sujet, description, user_id } = req.body;

    // Check if user exists
    const user = await User.findOneBy({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Create reclamation
    const reclamation = Reclamation.create({
      sujet,
      description,
      statut: 'En attente',
      user
    });

    await reclamation.save();
    res.status(201).json(reclamation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Update reclamation status and response
export const updateReclamation = async (req: Request, res: Response) => {
  try {
    const { statut, reponse } = req.body;
    
    // Find reclamation
    const reclamation = await Reclamation.findOneBy({ id: req.params.id });
    if (!reclamation) {
      return res.status(404).json({ message: "Réclamation non trouvée" });
    }

    // Update fields
    if (statut) {
      reclamation.statut = statut;
    }
    
    if (reponse) {
      reclamation.reponse = reponse;
      reclamation.date_reponse = new Date();
      
      // Always update status to "Traitée" when a response is provided
      // This ensures the status is updated regardless of what the client sends
      reclamation.statut = "Traitée";
    }

    await reclamation.save();
    res.json(reclamation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Delete reclamation
export const deleteReclamation = async (req: Request, res: Response) => {
  try {
    const reclamation = await Reclamation.findOneBy({ id: req.params.id });
    
    if (!reclamation) {
      return res.status(404).json({ message: "Réclamation non trouvée" });
    }

    await reclamation.remove();
    res.status(200).json({ message: "Réclamation supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};