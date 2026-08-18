import { Request, Response } from "express";

const EMSIFA_BASE = "https://emsifa.github.io/api-wilayah-indonesia/api";

const wilayahController = {
    async getProvinces(req: Request, res: Response) {
        try {
            const response = await fetch(`${EMSIFA_BASE}/provinces.json`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil data provinsi" });
        }
    },

    async getRegencies(req: Request, res: Response) {
        try {
            const { provinceId } = req.params;
            const response = await fetch(`${EMSIFA_BASE}/regencies/${provinceId}.json`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil data kabupaten/kota" });
        }
    },

    async getDistricts(req: Request, res: Response) {
        try {
            const { regencyId } = req.params;
            const response = await fetch(`${EMSIFA_BASE}/districts/${regencyId}.json`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil data kecamatan" });
        }
    },

    async getVillages(req: Request, res: Response) {
        try {
            const { districtId } = req.params;
            const response = await fetch(`${EMSIFA_BASE}/villages/${districtId}.json`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil data desa/kelurahan" });
        }
    },
};

export default wilayahController;