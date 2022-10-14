import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"
dotenv.config()

export function hash (password: string) {
   const hashedPass = bcrypt.hashSync(password, 12)
   return hashedPass 
}

export function verify (password: string, hash: string) {
  return  bcrypt.compareSync(password, hash)
}

export function generateToken (id: number) {
 return  jwt.sign({id}, process.env.SECRET!)

}

export function getCurrentUser () {}