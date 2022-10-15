import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();
const SECRET = process.env.SECRET!;

export function hash(password: string) {
  const hashedPass = bcrypt.hashSync(password, 12);
  return hashedPass;
}

export function verify(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(id: number) {
  const token = jwt.sign({ id }, SECRET, { expiresIn: "1h" });
  return token;
}

export async function getCurrentUser(token: string) {
  try {
    const data = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({
      //@ts-ignore
      where: { id: data.id },
      include: { bookings: true },
    });
    return user;
  } catch (error) {
    return null;
  }
}
