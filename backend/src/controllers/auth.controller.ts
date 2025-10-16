import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import crypto from 'crypto'
import emailjs from '@emailjs/nodejs'

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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string }
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(200).json({ message: 'If the email exists, a reset link will be sent' })

    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.set({ resetPasswordToken: hashed, resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000) })
    await user.save()

    const resetUrlBase = process.env.APP_RESET_URL || 'https://example.com/reset-password'
    const resetLink = `${resetUrlBase}?token=${encodeURIComponent(rawToken)}`

    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID!,
        process.env.EMAILJS_TEMPLATE_ID!,
        {
          to_email: email,
          name: 'GreenMeter Support',
          time: new Date().toLocaleString(),
          message: `Use this link to reset your password: ${resetLink}`,
          token: rawToken,
        },
        { publicKey: 'server', privateKey: process.env.EMAILJS_PRIVATE_KEY! }
      )
    } catch (e) {
      console.error('EmailJS error', e)
    }

    return res.status(200).json({ message: 'If the email exists, a reset link will be sent' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string }
    if (!token || !newPassword) return res.status(400).json({ message: 'Missing fields' })
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const hashed = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    })
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' })

    user.password = await bcrypt.hash(newPassword, 10)
    user.resetPasswordToken = undefined as any
    user.resetPasswordExpires = undefined as any
    await user.save()
    return res.json({ message: 'Password reset successful' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { name, email } = req.body as { name?: string; email?: string }

    const updates: any = {}
    if (typeof name === 'string') updates.name = name
    if (typeof email === 'string') updates.email = email

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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string }
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' })
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const user = await User.findById(userId).select('+password')
    if (!user || !user.password) return res.status(404).json({ message: 'User not found' })

    const matches = await bcrypt.compare(currentPassword, user.password)
    if (!matches) return res.status(400).json({ message: 'Current password is incorrect' })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    return res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}