import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        trim: true,
        required: true
    },
    email :{
        type : String,
        unique : true,
        required: true,
        lowercase : true
    },
    password :{
        type : String,
        required: true,
        minlength : 8
    },
    questions:{
        type: Number,
        default:0
    },
    streak:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0,
    }
},
{
    timestamps: true
});


const User = mongoose.model("User", UserSchema,"data");
export default User;

