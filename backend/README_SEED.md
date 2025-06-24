ccd# Database Seeding Guide

## Overview
File `seed.js` digunakan untuk mengisi database dengan data awal berupa user admin dan subadmin.

## Data yang Akan Dibuat

### 5 Admin Users
- **admin1** - Password: admin123
- **admin2** - Password: admin456
- **admin3** - Password: admin789
- **admin4** - Password: admin2024
- **admin5** - Password: admin2025
- **Role**: admin

### 10 Subadmin Users
- **subadmin-a** - Password: sub123 - Wilayah: Kecamatan A
- **subadmin-b** - Password: sub456 - Wilayah: Kecamatan B
- **subadmin-c** - Password: sub789 - Wilayah: Kecamatan C
- **subadmin-d** - Password: sub2024 - Wilayah: Kecamatan D
- **subadmin-e** - Password: sub2025 - Wilayah: Kecamatan E
- **subadmin-f** - Password: subabc - Wilayah: Kecamatan F
- **subadmin-g** - Password: subdef - Wilayah: Kecamatan G
- **subadmin-h** - Password: subghi - Wilayah: Kecamatan H
- **subadmin-i** - Password: subjkl - Wilayah: Kecamatan I
- **subadmin-j** - Password: submno - Wilayah: Kecamatan J
- **Role**: subadmin

## Cara Menjalankan

### 1. Pastikan Database Terhubung
Pastikan konfigurasi database di `config/database.js` sudah benar dan database server berjalan.

### 2. Jalankan Seed
```bash
cd backend
node seed.js
```

### 3. Output yang Diharapkan
```
✅ DB connected
🔄 Creating admin users...
✅ Created admin: admin1
✅ Created admin: admin2
✅ Created admin: admin3
✅ Created admin: admin4
✅ Created admin: admin5
🔄 Creating subadmin users...
✅ Created subadmin: subadmin-a
✅ Created subadmin: subadmin-b
✅ Created subadmin: subadmin-c
✅ Created subadmin: subadmin-d
✅ Created subadmin: subadmin-e
✅ Created subadmin: subadmin-f
✅ Created subadmin: subadmin-g
✅ Created subadmin: subadmin-h
✅ Created subadmin: subadmin-i
✅ Created subadmin: subadmin-j
✅ All users seeded successfully!
📊 Summary: 5 admins, 10 subadmins
🔑 Admin passwords:
   admin1: admin123
   admin2: admin456
   admin3: admin789
   admin4: admin2024
   admin5: admin2025
🔑 Subadmin passwords:
   subadmin-a: sub123
   subadmin-b: sub456
   subadmin-c: sub789
   subadmin-d: sub2024
   subadmin-e: sub2025
   subadmin-f: subabc
   subadmin-g: subdef
   subadmin-h: subghi
   subadmin-i: subjkl
   subadmin-j: submno
```

## Reset Data (Optional)
Jika ingin menghapus data existing sebelum seeding, uncomment baris berikut di `seed.js`:
```javascript
// await User.destroy({ where: {} });
// console.log("🗑️ Existing users deleted");
```

## Login Credentials

### Admin Access
| Username | Password |
|----------|----------|
| admin1   | admin123 |
| admin2   | admin456 |
| admin3   | admin789 |
| admin4   | admin2024 |
| admin5   | admin2025 |

### Subadmin Access
| Username | Password | Wilayah |
|----------|----------|---------|
| subadmin-a | sub123 | Kecamatan A |
| subadmin-b | sub456 | Kecamatan B |
| subadmin-c | sub789 | Kecamatan C |
| subadmin-d | sub2024 | Kecamatan D |
| subadmin-e | sub2025 | Kecamatan E |
| subadmin-f | subabc | Kecamatan F |
| subadmin-g | subdef | Kecamatan G |
| subadmin-h | subghi | Kecamatan H |
| subadmin-i | subjkl | Kecamatan I |
| subadmin-j | submno | Kecamatan J |

## Troubleshooting

### Error: "Duplicate entry"
Jika muncul error duplicate entry, berarti username sudah ada di database. Gunakan reset data atau hapus manual user yang duplikat.

### Error: "Connection refused"
Pastikan database server (MySQL/PostgreSQL) sudah berjalan dan konfigurasi connection string sudah benar.

### Error: "Table doesn't exist"
Pastikan model sudah di-sync dengan database. Cek apakah `db.sync()` berjalan dengan benar. 