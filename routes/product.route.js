import { Router } from "express";
import authentication from "../middleware/auth.middleware.js";
import { createProductController, uploadProductImagesController } from "../controllers/product.controller.js"
import upload from '../middleware/multer.middleware.js'
 
const productRoute=Router()

productRoute.post('/upload-product-img',authentication, upload.array('images'),uploadProductImagesController);

productRoute.post('/create-product',authentication,createProductController)

export default productRoute