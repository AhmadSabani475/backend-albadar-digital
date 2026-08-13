import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import { checkRole } from "../middleware/route.middleware";
import kamarController from "../controllers/kamar.controller";
import asramaController from "../controllers/asrama.controller";
import usersController from "../controllers/users.controller";
import santriController from "../controllers/santri.controller";

const router = express.Router();
router.get('/users', authMiddleware, checkRole(['admin']), usersController.getAllUsers);
router.post('/users', authMiddleware, checkRole(['admin']), usersController.createUser);

router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);
router.put('/auth/complete-profile', authMiddleware, authController.completeProfile);

router.post('/santri', authMiddleware, checkRole(['admin']), santriController.createSantri);
router.get('/santri', authMiddleware, checkRole(['admin']), santriController.santriFindAll);
router.get('/santri/:id', authMiddleware, santriController.getSantriById);
router.put('/santri/:id', authMiddleware, checkRole(['admin']), santriController.editSantriById)

router.post('/asrama', authMiddleware, checkRole(['admin']), asramaController.create);
router.get('/asrama', authMiddleware, asramaController.findAll);

router.post('/kamar', authMiddleware, checkRole(['admin']), kamarController.create);
router.get('/kamar', authMiddleware, kamarController.findAll);

export default router;