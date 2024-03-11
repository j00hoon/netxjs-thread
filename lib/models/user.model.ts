import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id : { 
        type: String, 
        required: true, 
    },
    username : { 
        type: String, 
        required: true, 
        unique: true, 
    },
    name : { 
        type: String, 
        required: true, 
    },
    image : String,
    bio : String,
    threads : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Thread",
        },
    ],
    onboarded : {
        type : Boolean,
        default : false,
    },
    communities : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Community",
        },
    ],
});


// Whenever 1st time to call a user, db needs to create a user
// mongoose.model('User', userSchema) --> 1st
// From 2nd time to call a user, db can retrieve a user from db.
// mongoose.models.User --> 2nd
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;