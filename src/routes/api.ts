import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import { checkRole } from "../middleware/route.middleware";
import kamarController from "../controllers/kamar.controller";
import asramaController from "../controllers/asrama.controller";
import usersController from "../controllers/users.controller";
import santriController from "../controllers/santri.controller";
import sekolahController from "../controllers/sekolah.controller";

const router = express.Router();
router.get('/users', authMiddleware, checkRole(['admin']), usersController.findAllUsers);
router.post('/users', authMiddleware, checkRole(['admin']), usersController.create);
router.delete('/users/:id', authMiddleware, checkRole(['admin']), usersController.deleteById)

router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);
router.put('/auth/set-password', authMiddleware, authController.setPassword);

router.post('/santri', authMiddleware, checkRole(['admin']), santriController.create);
router.get('/santri', authMiddleware, checkRole(['admin']), santriController.findAll);
router.get('/santri/:id', authMiddleware, checkRole(['admin']), santriController.findById);
router.put('/santri/:id', authMiddleware, checkRole(['admin']), santriController.editById)
router.delete('/santri/:id', authMiddleware, checkRole(['admin']), santriController.deleteById)

router.post('/asrama', authMiddleware, checkRole(['admin']), asramaController.create);
router.get('/asrama', authMiddleware, asramaController.findAll);

router.post('/kamar', authMiddleware, checkRole(['admin']), kamarController.create);
router.get('/kamar', authMiddleware, kamarController.findAll);

router.get('/sekolah', authMiddleware, sekolahController.findAll);
router.post('/sekolah', authMiddleware, checkRole(['admin']), sekolahController.create);

export default router;