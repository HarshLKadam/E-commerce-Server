import  { Schema,model} from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    images: [
        {
            type: String
        }
    ],
    color: {
        type: String
    },
    parentCategoryName: {
        type: String
    },
    parentCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default:null
    }

}, {
    timestamps: true
})

const Category = model("Category", categorySchema)
export default Category