import mongoose,{Schema,model} from "mongoose";
 
const cartProductSchema=new Schema({
    productId:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity:{
        type:Number,
        default:1
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
}
)

const CartProduct= model("CartProduct",cartProductSchema)

export default CartProduct