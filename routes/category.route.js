import { Router } from "express";
import authentication from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import { createCategoryController, deleteCategoryController, getCategoryController, getCategoryCountController, getSingleCategoryCountController, getSubCategoryCountController, removeImageFromCloudinary, updateCategoryController, uploadImagesController } from "../controllers/category.controller.js";


const categoryRoute = Router()

categoryRoute.post('/upload-images',authentication, upload.array('images'),uploadImagesController);

categoryRoute.post('/create',authentication,createCategoryController)

categoryRoute.get('/get-category',getCategoryController)

categoryRoute.get('/get/category-count',getCategoryCountController)

categoryRoute.get('/get/count/sub-category',getSubCategoryCountController)

categoryRoute.get('/:id',getSingleCategoryCountController)

categoryRoute.delete('/remove-image',authentication,removeImageFromCloudinary)

categoryRoute.delete('/:id',authentication,deleteCategoryController)

categoryRoute.put('/update-category/:id',authentication,updateCategoryController)

export default categoryRoute;