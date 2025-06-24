// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/database.js";

// Import semua routes
import UserRoute from "./routes/userroutes.js";
import PackageRoute from "./routes/packageroutes.js";
import CustomerRoute from "./routes/customerroutes.js";
import PaymentRoute from "./routes/paymentroutes.js";

// Import relasi antar model
import "./models/association.js"; // pastikan ini mengatur relasi antar models

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware global
app.use(cors({
  origin: ["https://usaha-gweh.vercel.app", "https://abira-net.vercel.app"],
  credentials: true
}));
app.use(express.json());

// Daftarkan semua route API
app.use("/abira-api/users", UserRoute);         // login, tambah admin/subadmin
app.use("/abira-api/packages", PackageRoute);   // manajemen paket
app.use("/abira-api/customers", CustomerRoute); // pelanggan internet
app.use("/abira-api/payments", PaymentRoute);   // data pembayaran per bulan 

// Root path
app.get("/", (req, res) => {
  res.json({ msg: "🌐 API Usaha Internet aktif dan berjalan" });
});

// Start server
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("✅ Database connected...");

    await db.sync({ alter: true }); // WARNING: Semua tabel akan di-drop dan dibuat ulang!
    console.log("✅ Database synced...");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

startServer();
