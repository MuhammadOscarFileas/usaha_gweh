// seed_users.js
import bcrypt from "bcrypt";
//import dotenv from "dotenv";
import db from "./config/database.js";
import User from "./models/users_model.js";
import "./models/association.js"; // pastikan relasi dimuat jika ada

//dotenv.config();

const seedUsers = async () => {
  try {
    await db.authenticate();
    console.log("✅ DB connected");

    await db.sync(); // pakai { alter: true } jika perlu

    // Data untuk 5 Admin dengan password berbeda
    // const adminUsers = [
    //   {
    //     username: "admin1",
    //     password: await bcrypt.hash("admin123", 10),
    //     role: "admin"
    //   },
    //   {
    //     username: "admin2",
    //     password: await bcrypt.hash("admin456", 10),
    //     role: "admin"
    //   },
    //   {
    //     username: "admin3",
    //     password: await bcrypt.hash("admin789", 10),
    //     role: "admin"
    //   },
    //   {
    //     username: "admin4",
    //     password: await bcrypt.hash("admin2024", 10),
    //     role: "admin"
    //   },
    //   {
    //     username: "admin5",
    //     password: await bcrypt.hash("admin2025", 10),
    //     role: "admin"
    //   }
    // ];

    // Data untuk 10 Subadmin dengan password berbeda
    // const subadminUsers = [
    //   {
    //     username: "subadmin-a",
    //     password: await bcrypt.hash("sub123", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan A"
    //   },
    //   {
    //     username: "subadmin-b",
    //     password: await bcrypt.hash("sub456", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan B"
    //   },
    //   {
    //     username: "subadmin-c",
    //     password: await bcrypt.hash("sub789", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan C"
    //   },
    //   {
    //     username: "subadmin-d",
    //     password: await bcrypt.hash("sub2024", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan D"
    //   },
    //   {
    //     username: "subadmin-e",
    //     password: await bcrypt.hash("sub2025", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan E"
    //   },
    //   {
    //     username: "subadmin-f",
    //     password: await bcrypt.hash("subabc", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan F"
    //   },
    //   {
    //     username: "subadmin-g",
    //     password: await bcrypt.hash("subdef", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan G"
    //   },
    //   {
    //     username: "subadmin-h",
    //     password: await bcrypt.hash("subghi", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan H"
    //   },
    //   {
    //     username: "subadmin-i",
    //     password: await bcrypt.hash("subjkl", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan I"
    //   },
    //   {
    //     username: "subadmin-j",
    //     password: await bcrypt.hash("submno", 10),
    //     role: "subadmin",
    //     wilayah: "Kecamatan J"
    //   }
    // ];

    // Data untuk 1 Superadmin
    const superadminUser = {
      username: "superadmin",
      password: await bcrypt.hash("superadmin123", 10),
      role: "superadmin"
    };

    // Hapus data existing (optional - uncomment jika ingin reset data)
    // await User.destroy({ where: {} });
    // console.log("🗑️ Existing users deleted");

    // Buat admin users
    // console.log("🔄 Creating admin users...");
    // for (const admin of adminUsers) {
    //   await User.create(admin);
    //   console.log(`✅ Created admin: ${admin.username}`);
    // }

    // // Buat subadmin users
    // console.log("🔄 Creating subadmin users...");
    // for (const subadmin of subadminUsers) {
    //   await User.create(subadmin);
    //   console.log(`✅ Created subadmin: ${subadmin.username}`);
    // }

    // Buat superadmin user
    console.log("🔄 Creating superadmin user...");
    await User.create(superadminUser);
    console.log(`✅ Created superadmin: ${superadminUser.username}`);

    // console.log("✅ All users seeded successfully!");
    // console.log(`📊 Summary: ${adminUsers.length} admins, ${subadminUsers.length} subadmins`);
    // console.log("🔑 Admin passwords:");
    // console.log("   admin1: admin123");
    // console.log("   admin2: admin456");
    // console.log("   admin3: admin789");
    // console.log("   admin4: admin2024");
    // console.log("   admin5: admin2025");
    // console.log("🔑 Subadmin passwords:");
    // console.log("   subadmin-a: sub123");
    // console.log("   subadmin-b: sub456");
    // console.log("   subadmin-c: sub789");
    // console.log("   subadmin-d: sub2024");
    // console.log("   subadmin-e: sub2025");
    // console.log("   subadmin-f: subabc");
    // console.log("   subadmin-g: subdef");
    // console.log("   subadmin-h: subghi");
    // console.log("   subadmin-i: subjkl");
    // console.log("   subadmin-j: submno");
    // process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding users:", err.message);
    console.error("❌ Full error:", err);
    process.exit(1);
  }
};

seedUsers();
