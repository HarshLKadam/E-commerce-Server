import mongoose,{Schema,model} from "mongoose";
 
const cartProductSchema=new Schema({
    productId:{
        type:Schema.ObjectId,
        ref:"Product"
    },
    quantity:{
        type:Number,
        default:1
    },
    UserId:{
        type:Schema.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
}
)

const CartProduct= model("CartProduct",cartProductSchema)

export default CartProduct