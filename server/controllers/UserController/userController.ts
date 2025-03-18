import { Request, Response } from 'express';
import { User } from '../../models/User';
import { Compte } from '../../models/Compte';
import bcrypt from 'bcrypt';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneBy({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const { nom, email, mot_de_passe, numero_telephone, pays, adresse, est_admin } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    
    const user = User.create({
      nom,
      email,
      mot_de_passe: hashedPassword,
      numero_telephone,
      pays,
      adresse,
      est_admin: est_admin || false
    });
    
    await user.save();
    
    const compte = new Compte();
    compte.user = user;
    compte.solde = 0;
    await compte.save();
    
    res.status(201).json({
      user,
      compte
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If password is being updated, hash it
    if (req.body.mot_de_passe) {
      req.body.mot_de_passe = await bcrypt.hash(req.body.mot_de_passe, 10);
    }
    
    User.merge(user, req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneBy({ id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.remove();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};