import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import { checkRole } from "../middleware/route.middleware";
const router = express.Router();
router.post('/auth', authMiddleware, checkRole(['admin']), authController.createUser);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);
export default router;