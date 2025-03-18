import { Request, Response } from 'express';
import { Compte } from '../../models/Compte';
import { User } from '../../models/User';

// Get all accounts
export const getComptes = async (req: Request, res: Response) => {
  try {
    const comptes = await Compte.find({
      relations: ['user']
    });
    res.json(comptes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Get account by ID
export const getCompteById = async (req: Request, res: Response) => {
  try {
    const compte = await Compte.findOne({
      where: { id: req.params.id },
      relations: ['user']
    });
    
    if (!compte) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    res.json(compte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Get account by user ID
export const getCompteByUserId = async (req: Request, res: Response) => {
  try {
    const compte = await Compte.findOne({
      where: { user: { id: req.params.userId } },
      relations: ['user']
    });
    
    if (!compte) {
      return res.status(404).json({ message: "Account not found for this user" });
    }
    
    res.json(compte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Create a new account
export const addCompte = async (req: Request, res: Response) => {
  try {
    const { user_id, solde } = req.body;
    
    // Check if user exists
    const user = await User.findOneBy({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if user already has an account
    const existingCompte = await Compte.findOne({
      where: { user: { id: user_id } }
    });
    
    if (existingCompte) {
      return res.status(400).json({ message: "User already has an account" });
    }
    
    // Create new account
    const compte = new Compte();
    compte.user = user;
    compte.solde = solde || 0;
    
    await compte.save();
    res.status(201).json(compte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Update account
export const updateCompte = async (req: Request, res: Response) => {
  try {
    const compte = await Compte.findOneBy({ id: req.params.id });
    if (!compte) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    const { solde } = req.body;
    
    if (solde !== undefined) {
      compte.solde = solde;
    }
    
    await compte.save();
    res.json(compte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Add funds to account
export const addFunds = async (req: Request, res: Response) => {
  try {
    const compte = await Compte.findOneBy({ id: req.params.id });
    if (!compte) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    compte.solde += parseFloat(amount);
    await compte.save();
    
    res.json({ 
      message: "Funds added successfully", 
      compte 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Add funds to account by user ID
export const addFundsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    const compte = await Compte.findOne({
      where: { user: { id: userId } }
    });
    
    if (!compte) {
      return res.status(404).json({ message: "Account not found for this user" });
    }
    
    // Fix decimal handling by converting both values to numbers first
    const currentSolde = parseFloat(compte.solde.toString());
    const amountToAdd = parseFloat(amount.toString());
    compte.solde = currentSolde + amountToAdd;
    
    await compte.save();
    
    // Return the updated account with properly formatted solde
    res.json({ 
      message: "Funds added successfully", 
      compte: {
        ...compte,
        solde: parseFloat(compte.solde.toString())
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Withdraw funds from account
export const withdrawFunds = async (req: Request, res: Response) => {
  try {
    const compte = await Compte.findOneBy({ id: req.params.id });
    if (!compte) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    if (compte.solde < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    
    compte.solde -= parseFloat(amount);
    await compte.save();
    
    res.json({ 
      message: "Funds withdrawn successfully", 
      compte 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

// Delete account
export const deleteCompte = async (req: Request, res: Response) => {
  try {
    const compte = await Compte.findOneBy({ id: req.params.id });
    
    if (!compte) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    await compte.remove();
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};