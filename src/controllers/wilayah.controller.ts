import { Request, Response } from "express";

const EMSIFA_BASE = "https://emsifa.github.io/api-wilayah-indonesia/api";

const wilayahController = {
    async getProvinces(req: Request, res: Response) {
        /**
         #swagger.tags = ['Wilayah']
         #swagger.summary = 'Ambil daftar provinsi di Indonesia'
         */
        try {
            const response = await fetch(`${EMSIFA_BASE}/provinces.json`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil data provinsi" });
        }
    },

    async getRegencies(req: Request, res: Response) {
        /**
         #swagger.tags = ['Wilayah']
         #swagger.summary = 'Ambil daftar kabupaten/kota berdasarkan ID provinsi'
         #swagger.parameters['provinceId'] = { in: 'path', required: true, type: 'string' }
         */
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
        /**
         #swagger.tags = ['Wilayah']
         #swagger.summary = 'Ambil daftar kecamatan berdasarkan ID kabupaten/kota'
         #swagger.parameters['regencyId'] = { in: 'path', required: true, type: 'string' }
         */
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
        /**
         #swagger.tags = ['Wilayah']
         #swagger.summary = 'Ambil daftar desa/kelurahan berdasarkan ID kecamatan'
         #swagger.parameters['districtId'] = { in: 'path', required: true, type: 'string' }
         */
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