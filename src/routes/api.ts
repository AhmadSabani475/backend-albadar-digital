import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import { checkRole } from "../middleware/route.middleware";
import kamarController from "../controllers/kamar.controller";
import asramaController from "../controllers/asrama.controller";
import usersController from "../controllers/users.controller";

const router = express.Router();
router.post('/users', authMiddleware, checkRole(['admin']), usersController.createUser);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);
router.put('/auth/complete-profile', authMiddleware, authController.completeProfile);

router.post('/asrama', authMiddleware, checkRole(['admin']), asramaController.create);
router.get('/asrama', authMiddleware, asramaController.findAll);

router.post('/kamar', authMiddleware, checkRole(['admin']), kamarController.create);
router.get('/kamar', authMiddleware, kamarController.findAll);

export default router;