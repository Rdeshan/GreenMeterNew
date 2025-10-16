import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export const registerUser = async (req: Request, res: Response) => {
  console.log("registerUser")
  try {
    const { email, password, name } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      email,
      password: hashedPassword,
      name
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '1d'
    })

    res.status(201).json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  console.log("loginUser")
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password!)
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '1d'
    })

    res.json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { name, email, password } = req.body as { name?: string; email?: string; password?: string }

    const updates: any = {}
    if (typeof name === 'string') updates.name = name
    if (typeof email === 'string') updates.email = email
    if (typeof password === 'string' && password.trim().length > 0) {
      updates.password = await bcrypt.hash(password, 10)
    }

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true })
    if (!updated) return res.status(404).json({ message: 'User not found' })

    const safeUser = updated.toObject()
    delete (safeUser as any).password

    return res.json({ user: safeUser })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}