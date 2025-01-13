import { Router } from "express";
import authentication from "../middleware/auth.middleware.js";
<<<<<<< HEAD
import { createProductController, getAllProductByCategoryIdController, getAllProductByCategoryNameController, getAllProductBySubCategoryIdController, getAllProductBySubCategoryNameController, getAllProductController, uploadProductImagesController } from "../controllers/product.controller.js"
=======
import { createProductController, uploadProductImagesController } from "../controllers/product.controller.js"
>>>>>>> 2e921e583136f4556ffe55d16494bc33e2369aa2
import upload from '../middleware/multer.middleware.js'
 
const productRoute=Router()

productRoute.post('/upload-product-img',authentication, upload.array('images'),uploadProductImagesController);

productRoute.post('/create-product',authentication,createProductController)

<<<<<<< HEAD
productRoute.get('/get-all-product',getAllProductController)

productRoute.get('/get-product-categoryId/:id',getAllProductByCategoryIdController)

productRoute.get('/get-product-categoryName',getAllProductByCategoryNameController)

productRoute.get('/get-product-subcategoryId/:id',getAllProductBySubCategoryIdController)

productRoute.get('/get-products-subcatgeoryName',getAllProductBySubCategoryNameController)



=======
>>>>>>> 2e921e583136f4556ffe55d16494bc33e2369aa2
export default productRoute