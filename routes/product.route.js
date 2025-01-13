import { Router } from "express";
import authentication from "../middleware/auth.middleware.js";
import { uploadProductImagesController,createProductController, getAllProductController,getAllProductByCategoryIdController,getAllProductByCategoryNameController,getAllProductBySubCategoryIdController,getAllProductBySubCategoryNameController } from "../controllers/product.controller.js";
import upload from '../middleware/multer.middleware.js'
 
const productRoute=Router()

productRoute.post('/upload-product-img',authentication, upload.array('images'),uploadProductImagesController);

productRoute.post('/create-product',authentication,createProductController)

productRoute.get('/get-all-product',getAllProductController)

productRoute.get('/get-product-categoryId/:id',getAllProductByCategoryIdController)

productRoute.get('/get-product-categoryName',getAllProductByCategoryNameController)

productRoute.get('/get-product-subcategoryId/:id',getAllProductBySubCategoryIdController)

productRoute.get('/get-products-subcatgeoryName',getAllProductBySubCategoryNameController)

export default productRoute


