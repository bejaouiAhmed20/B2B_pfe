import { Request, Response } from 'express';
import { User } from '../../models/User';
import bcrypt from 'bcrypt';
import { createToken } from '../../utils/tokenUtils';


export const login = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOneBy({ email });
    if (!user) {
      return res.status(401).json({ message: "Email does not exist" });
    }

    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValidPassword) {
      return res.status(401).json({ message: "mot de passe incorrect" });
    }

    if (!user.est_admin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};
export const loginClient = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOneBy({ email });
    if (!user) {
      return res.status(401).json({ message: "Email does not exist" });
    }

    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValidPassword) {
      return res.status(401).json({ message: "mot de passe incorrect" });
    }

    // No admin check for client login

    const token = createToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will handle removing the token
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue with logout" });
  }
};