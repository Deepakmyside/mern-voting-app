const express = require('express');
const router = express.Router();    

const{jwtAuthMiddleware, generateToken}  = require('../jwt');
const User = require('../models/user');
const Candidate = require('../models/candidate');

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

// POST  route to add a candidate
router.post('/',jwtAuthMiddleware,async (req, res) => {
    try{
          if(! await checkAdminRole(req.user.id)) {
            return res.status(404).json({message: 'user has not admin role'});
        }

        const data = req.body // Assuming the request body contains the candidate data 

        // Create a new User document using the Mongoose model 
        const newCandidate  = new Candidate(data);
        // Save the User document to the database   
        const  response = await newCandidate.save();
        console.log('data saved');

        const payload ={
        id: response.id,
        username: response.username,
        }

        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

     
router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=> {
    try{ 
          if( await !checkAdminRole(req.user.id)) {
            return res.status(403).json({message: 'user has not admin role'});
          }
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person
         
       const response = await Candidate.findByIdAndUpdate( candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
        if( await !checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Extract the updated candidate data from the request body

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }

})

// let's start voting

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
     // No admin can vote 
     // user can only vote once

     candidateID = req.params.candidateID;
     userId = req.user.id;
     try{
        //find the candidaate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }
     const user = await User.findById(userId);
     if(!user){
        return res.status(404).json({ message: 'user not found' });
     }
     if(user.isVoted){
        return res.status(400).json({ message: 'You have already voted' }); 
     }
     if(user.role == 'admin'){
        return res.status(403).json({ message: 'admin is not allowed'});
     }
     
     // Update the candidate document to record the vote
        candidate.votes.push({user: userId});   
        candidate.voteCount++;
        await candidate.save(); 

        // update the user document
        user.isVoted = true;    
        await user.save();
        return res.status(200).json({ message: 'Vote recorded successfully' });

     }catch(err){
         console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
     }
});


//vote count
router.get('/vote/count', async (req, res) => {
    try{ 
        // Find all candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            };
        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
      });
    
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find();
const candidateList = candidates.map((data) => {
            return {
               id : data._id,
               voteCount: data.voteCount
            };
        });

        // Return the list of candidates
        res.status(200).json(candidateList);
    } 
    
catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



    
module.exports = router;