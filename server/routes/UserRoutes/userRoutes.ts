import express, { Request, Response } from 'express';
import { getUsers, addUser, updateUser, deleteUser, getUserById } from '../../controllers/UserController/userController';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById as express.RequestHandler);
router.post('/', addUser);
router.put('/:id', updateUser as express.RequestHandler);
router.delete('/:id', deleteUser as express.RequestHandler);

export default router;