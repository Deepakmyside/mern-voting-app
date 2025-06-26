const express = require('express');
const router = express.Router();    
const User = require('../models/user');
const{jwtAuthMiddleware, generateToken}  = require('./../jwt');
const user = require('../models/user');



const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID)
        if(user && user.role === 'admin') {
            return true; // User has admin role
        }
    } catch (error) {  
        return false;
    }   
}

router.get('/checkAdmin/:id',async (req, res) => {
    try {
        const userId = req.params.id; // Extract the id from the URL parameter
        const isAdmin = await checkAdminRole(userId);
        if (isAdmin) {
         res.send({ message: 'User has admin role' });
        } else {
         res.send({ message: 'User does not have admin role' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
   
    }
});


router.post('/signup',async (req, res) => {
    try{
        const data = req.body; // Assuming the request body contains the User data 

         if (data.role === 'admin') {
            const adminExists = await User.findOne({ role: 'admin' });
            if (adminExists) {
                return res.status(403).json({ message: 'Admin already exists' });
            }
        }
        // Create a new User document using the Mongoose model 
        const newUser  = new User(data);
        // Save the User document to the database   
        const  response = await newUser.save();
        console.log('data saved');

        const payload ={
        id: response.id,
        username: response.username,
        }

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is :", token);

        res.status(200).json({response: response,token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
router.put('/profile/password', jwtAuthMiddleware, async (req, res)=> {
    try{
        const userId = req.user; //Extract the id from the token 
        const {currentPassword, newPassword} = req.body // Extract current and new password from request body

        // Find the user by id
        const user = await User.findById(userId);
   

        //If password does not match, return error
        if (!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({ error: 'Invalid username or password' });
        }
     
        //Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });

        //pass related   

    userSchema.pre('save', async function(next){
        const person = this;

    // Hash the password only if it has been modified (or is new)
    if(!person.isModified('password')) return next();
    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(person.password, salt);
        
        // Override the plain password with the hashed one
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}


    }
})
module.exports = router;