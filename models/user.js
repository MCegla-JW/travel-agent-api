import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        return ret
      },
    },
  },
)

userSchema.virtual('confirmPassword').set(function (passwordValue) {
  this._confirmPassword = passwordValue
})

userSchema.pre('validate', function () {
  if (this.isModified('password') && this.password !== this._confirmPassword) {
    this.invalidate('confirmPassword', 'Passwords do not match')
  }
})

userSchema.pre('save', function () {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 12)
  }
})

const User = mongoose.model('User', userSchema)

export default User
