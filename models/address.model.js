import mongoose, { Schema ,model} from "mongoose";

const addressSchema= new Schema({
    address_line:{
        type:String,
        default:""
    },
    city:{
        type:String,
        default:""
    },
    state:{
        type:String,
        default:""
    },
    pincode:{
        type:String,
        default:""
    },
    country:{
        type:String
    },
    mobile_no:{
        type:Number,
        default:null
    },
    status:{
        type:Boolean,
        default:true
    },
    userId:{
        type:Schema.ObjectId,
        ref:UserModel,
        default:""
    }
},{
    Timestamp:true
}
)

const Address=model('Address',addressSchema)

export default Address