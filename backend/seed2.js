import Customer from './models/customer_model.js';

(async () => {
  try {
    const deleted = await Customer.destroy({ where: { id: 1 } });
    if (deleted) {
      console.log('Customer dengan id 1 berhasil dihapus.');
    } else {
      console.log('Customer dengan id 1 tidak ditemukan.');
    }
  } catch (err) {
    console.error('Gagal menghapus customer:', err);
  } finally {
    process.exit();
  }
})(); 