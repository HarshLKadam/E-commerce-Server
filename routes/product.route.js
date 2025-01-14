import { Router } from "express";
import authentication from "../middleware/auth.middleware.js";
import { uploadProductImagesController,createProductController, getAllProductController,getAllProductByCategoryIdController,getAllProductByCategoryNameController,getAllProductBySubCategoryIdController,getAllProductBySubCategoryNameController, getAllProductByPriceController, getAllProductByRatingController, getProductCountController, getFeaturedProductController, deleteProductController, getSingleProductController, removeImageFromCloudinary, updateProductController } from "../controllers/product.controller.js";
import upload from '../middleware/multer.middleware.js'
 
const productRoute=Router()

productRoute.post('/upload-product-img',authentication, upload.array('images'),uploadProductImagesController);

productRoute.post('/create-product',authentication,createProductController)

productRoute.get('/get-all-product',getAllProductController)

productRoute.get('/get-product-categoryId/:id',getAllProductByCategoryIdController)

productRoute.get('/get-product-categoryName',getAllProductByCategoryNameController)

productRoute.get('/get-product-subcategoryId/:id',getAllProductBySubCategoryIdController)

productRoute.get('/get-products-subcatgeoryName',getAllProductBySubCategoryNameController)

productRoute.get('/get-products-price',getAllProductByPriceController)

productRoute.get('/get-products-rating',getAllProductByRatingController)

productRoute.get('/get-product-count',getProductCountController)

productRoute.get('/get-featured-product',getFeaturedProductController)

productRoute.delete('/delete-product/:id',deleteProductController)

productRoute.get('/get-product/:id',getSingleProductController)

productRoute.delete('/remove-image',authentication,removeImageFromCloudinary)

productRoute.put('/update-product/:id',authentication,updateProductController)


export default productRoute


