import express, { Request, Response } from 'express';
import { getUsers, addUser, updateUser, deleteUser, getUserById } from '../../controllers/UserController/userController';
import { auth, AuthRequest } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getUsers);

// Route pour vérifier l'authentification de l'utilisateur
// IMPORTANT: Cette route doit être définie AVANT la route /:id pour éviter les conflits
router.get('/me/verify', auth as any, ((req, res, next) => {
  try {
    const user = (req as AuthRequest).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur authentifié',
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);

// Autres routes utilisateur
router.get('/:id', getUserById as express.RequestHandler);
router.post('/', addUser as express.RequestHandler);
router.put('/:id', updateUser as express.RequestHandler);
router.delete('/:id', deleteUser as express.RequestHandler);

export default router;