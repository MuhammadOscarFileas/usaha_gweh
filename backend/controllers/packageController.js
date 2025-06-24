import Package from "../models/package_model.js";

export const getPackages = async (req, res) => {
  const packages = await Package.findAll();
  res.json(packages);
};

export const createPackage = async (req, res) => {
  const { name, price } = req.body;
  await Package.create({ name, price });
  res.status(201).json({ msg: "Paket berhasil ditambahkan" });
};

export const updatePackage = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  await Package.update({ name, price }, { where: { id } });
  res.json({ msg: "Paket berhasil diperbarui" });
};

export const deletePackage = async (req, res) => {
  const { id } = req.params;
  await Package.destroy({ where: { id } });
  res.json({ msg: "Paket berhasil dihapus" });
};
