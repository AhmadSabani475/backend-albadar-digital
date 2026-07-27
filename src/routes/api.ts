import express from "express";
import dummy from "../controllers/dummy";
const router = express.Router();
router.get('/dummy', dummy.dummy);
export default router;