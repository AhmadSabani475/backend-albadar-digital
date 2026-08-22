import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";
import { checkRole } from "../middleware/route.middleware";
import kamarController from "../controllers/kamar.controller";
import asramaController from "../controllers/asrama.controller";
import usersController from "../controllers/users.controller";
import santriController from "../controllers/santri.controller";
import sekolahController from "../controllers/sekolah.controller";
import tahunajaranController from "../controllers/tahunajaran.controller";
import tingkatkelasController from "../controllers/tingkatkelas.controller";
import tingkatngajiController from "../controllers/tingkatngaji.controller";
import kelassantriController from "../controllers/kelassantri.controller";
import riwayatkelasngajiController from "../controllers/riwayatkelasngaji.controller";
import wilayahController from "../controllers/wilayah.controller";
import jenisTagihanController from "../controllers/jenisTagihan.controller";
import tarifKhususController from "../controllers/tarifKhusus.controller";
import tagihanController from "../controllers/tagihan.controller";

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


router.post('/tahun-ajaran', authMiddleware, checkRole(['admin']), tahunajaranController.create);
router.get('/tahun-ajaran', authMiddleware, tahunajaranController.findAll);
router.get('/tahun-ajaran/:id', authMiddleware, tahunajaranController.findById);
router.put('/tahun-ajaran/:id', authMiddleware, checkRole(['admin']), tahunajaranController.update);
router.delete('/tahun-ajaran/:id', authMiddleware, checkRole(['admin']), tahunajaranController.delete);

router.post('/tingkat-kelas', authMiddleware, checkRole(['admin']), tingkatkelasController.create);
router.get('/tingkat-kelas', authMiddleware, tingkatkelasController.findAll);
router.get('/tingkat-kelas/:id', authMiddleware, tingkatkelasController.findById);
router.put('/tingkat-kelas/:id', authMiddleware, checkRole(['admin']), tingkatkelasController.update);
router.delete('/tingkat-kelas/:id', authMiddleware, checkRole(['admin']), tingkatkelasController.delete);

router.post('/tingkat-ngaji', authMiddleware, checkRole(['admin']), tingkatngajiController.create);
router.get('/tingkat-ngaji', authMiddleware, tingkatngajiController.findAll);
router.get('/tingkat-ngaji/:id', authMiddleware, tingkatngajiController.findById);
router.put('/tingkat-ngaji/:id', authMiddleware, checkRole(['admin']), tingkatngajiController.update);
router.delete('/tingkat-ngaji/:id', authMiddleware, checkRole(['admin']), tingkatngajiController.delete);

router.post('/kelas-santri', authMiddleware, checkRole(['admin']), kelassantriController.create);
router.get('/kelas-santri', authMiddleware, kelassantriController.findAll);
router.delete('/kelas-santri/:id', authMiddleware, checkRole(['admin']), kelassantriController.delete);
router.post('/kelas-santri/naik-kelas', authMiddleware, checkRole(['admin']), kelassantriController.naikKelas);

router.post('/riwayat-kelas-ngaji', authMiddleware, checkRole(['admin']), riwayatkelasngajiController.create);
router.get('/riwayat-kelas-ngaji', authMiddleware, riwayatkelasngajiController.findAll);
router.put('/riwayat-kelas-ngaji/:id', authMiddleware, checkRole(['admin']), riwayatkelasngajiController.update);
router.delete('/riwayat-kelas-ngaji/:id', authMiddleware, checkRole(['admin']), riwayatkelasngajiController.delete);
router.post('/riwayat-kelas-ngaji/naik-kelas', authMiddleware, checkRole(['admin']), riwayatkelasngajiController.naikKelasNgaji);

router.get('/wilayah/provinces', authMiddleware, wilayahController.getProvinces);
router.get('/wilayah/regencies/:provinceId', authMiddleware, wilayahController.getRegencies);
router.get('/wilayah/districts/:regencyId', authMiddleware, wilayahController.getDistricts);
router.get('/wilayah/villages/:districtId', authMiddleware, wilayahController.getVillages);

router.get('/jenis-tagihan', authMiddleware, checkRole(['admin']), jenisTagihanController.findAll);
router.post('/jenis-tagihan', authMiddleware, checkRole(['admin']), jenisTagihanController.create);
router.get('/jenis-tagihan/:id', authMiddleware, checkRole(['admin']), jenisTagihanController.findById);
router.delete('/jenis-tagihan/:id', authMiddleware, checkRole(['admin']), jenisTagihanController.deleteById);
router.put('/jenis-tagihan/:id', authMiddleware, checkRole(['admin']), jenisTagihanController.editById);

router.get('/tarif-khusus', authMiddleware, checkRole(['admin']), tarifKhususController.findAll);
router.post('/tarif-khusus', authMiddleware, checkRole(['admin']), tarifKhususController.create);
router.delete('/tarif-khusus/:id', authMiddleware, checkRole(['admin']), tarifKhususController.deleteById);

router.post('/tagihan/generate-bulk', authMiddleware, checkRole(['admin']), tagihanController.createBulk);
router.get('/tagihan', authMiddleware, checkRole(['admin']), tagihanController.findAll);
router.post('/tagihan', authMiddleware, checkRole(['admin']), tagihanController.create);
export default router;