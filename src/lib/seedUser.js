import bcrypt from "bcryptjs";
import User from "./models/user.js";

export async function seedUser() {
  const existing = await User.findOne({ email: "cafesitoserr@gmail.com" });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({
      email: "cafesitoserr@gmail.com",
      password: hashed,
    });
    console.log("✅ Usuario inicial creado: cafesitoserr@gmail.com / admin123");
  } else {
    console.log("ℹ️ Usuario ya existe, no se creó otro.");
  }
}
