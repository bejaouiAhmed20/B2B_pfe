import { Request, Response } from 'express';
import { User } from '../../models/User';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "there is an issue" });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const user = User.create(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "there is an issue" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    User.merge(user, req.body);
    await user.save();
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneBy({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await user.remove();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};