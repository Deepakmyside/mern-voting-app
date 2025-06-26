const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age:{
        type: Number,
        required:true
    },
     email: {
        type: String,
        
    },
     mobile: {
        type: String,
    
    },
    address: {
        type: String,
        required: true 
    },
    aadharCardNumber: {
        type: String,
        required: true 
    },
    password: {
        type: String,
        required: true
    }, 
    role: {
        type: String,
        enum:['voter', 'admin'],
        default: 'voter',
    },
    isVoted:{
        type: Boolean,
        default:false 
    }
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log('Password hashed before save');
        next();
    } catch (err) {
        return next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};



const User = mongoose.model('User', userSchema);
module.exports = User;
