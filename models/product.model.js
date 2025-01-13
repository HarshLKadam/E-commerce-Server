import mongoose, {Schema,model} from "mongoose";
import Category from "./category.model.js";

const productSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    images:[
        {
            type:String,
            required:true
        }
    ],
    brand:{
        type:String,
        default:''
    },
    price:{
        type:String,
        default:0
    },
    oldPrice:{
        type:String,
        default:0
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'Category'
    },
    categoryName:{
        type:String,
        default:''
    },
    categoryId:{
        type:String,
        default:''
    },
    subCategoryId:{
        type:String,
        default:''
    },
    subCategoryName:{
        type:String,
        default:''
    },
    thirdSubCategoryId:{
        type:String,
        default:''
    },
    thirdSubCategoryName:{
        type:String,
        default:''
    },
    countInStock:{
        type:Number,
        required:true
    },
    rating:{
        type:Number,
        default:0
    },
    isFeatured:{
        type:Boolean,
        default:false
    },
    discount:{
        type:Number,
        required:true
    },
    size:[
        {
            type:String,
            default:null
        }
    ],
    productWeight:[
        {
            type:String,
            default:null
        }
    ],
   location:[
    {
        value:{
            type:String
        },
        label:{
            type:String
        }
    }
   ],
   dateCreated:{
    type:Date,
    default:Date.now()
   }
},{
    timestamps:true
})

const Product=model('Product',productSchema)

export default Product