import mongoose,{Schema,model} from "mongoose";

const orderSchema=new Schema({
    userId:{
        type:Schema.ObjectId,
        ref:"User"
    },
    OrderId:{
        type:String,
        required:[true,"provide order Id"],
        unique:true
    },
    ProductId:{
        type:Schema.ObjectId,
        ref:"Product"
    },
    Product_details:{
        type:String,
        image:Array
    },
    paymentId:{
        type:String,
        default:""
    },
    payment_status:{
        type:String,
        default:""
    },
    delivery_address:{
        type:Schema.ObjectId,
        ref:"Address"
    },
    subTotalAmount:{
        type:String,
        default:0
    },
    totalAmount:{
        type:Number,
        default:0
    },
  
},{
    timestamps:true
}
)

const Order=model("Order",orderSchema)

export default model