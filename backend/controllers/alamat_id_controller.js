import AlamatId from "../models/alamat_id_model.js";

export const getAllAlamat = async (req, res) => {
  const alamat = await AlamatId.findAll();
  res.json(alamat);
}; 