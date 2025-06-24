import AlamatId from "../models/alamat_id_model.js";

export const getAllAlamat = async (req, res) => {
  try {
    const alamat = await AlamatId.findAll();
    if (!alamat || alamat.length === 0) {
      return res.json({ alamat: [], msg: 'Data alamat kosong' });
    }
    res.json({ alamat, msg: 'Sukses ambil data alamat' });
  } catch (err) {
    res.status(500).json({ alamat: [], msg: 'Gagal mengambil data alamat', error: err.message });
  }
};

export const createAlamat = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ msg: 'Nama alamat wajib diisi' });
    const alamat = await AlamatId.create({ nama });
    res.status(201).json(alamat);
  } catch (err) {
    res.status(500).json({ msg: 'Gagal menambah alamat', error: err.message });
  }
};

export const updateAlamat = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;
    const alamat = await AlamatId.findByPk(id);
    if (!alamat) return res.status(404).json({ msg: 'Alamat tidak ditemukan' });
    alamat.nama = nama;
    await alamat.save();
    res.json(alamat);
  } catch (err) {
    res.status(500).json({ msg: 'Gagal update alamat', error: err.message });
  }
};

export const deleteAlamat = async (req, res) => {
  try {
    const { id } = req.params;
    const alamat = await AlamatId.findByPk(id);
    if (!alamat) return res.status(404).json({ msg: 'Alamat tidak ditemukan' });
    await alamat.destroy();
    res.json({ msg: 'Alamat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Gagal hapus alamat', error: err.message });
  }
}; 