import Product from "../models/product.model.js";

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true
});

var imageArray = [];
const uploadProductImagesController = async (req, res) => {
    try {
        imageArray = [];
        const image = req.files;

        if (!image || image.length === 0) {
            return res.status(400).json({
                message: 'No files received',
                error: true,
                success: false,
            });
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image.length; i++) {
            const result = await cloudinary.uploader.upload(image[i].path, options)
                .catch(error => {
                    console.error('Cloudinary upload error:', error);
                    return null;
                });

            if (result) {
                imageArray.push(result.secure_url);

                try {
                    fs.unlinkSync(image[i].path);
                } catch (err) {
                    console.error(`Failed to delete file: ${image[i].path}`, err);
                }
            } else {
                console.log(`Failed to upload image: ${image[i].path}`);
            }
        }
        if (imageArray.length > 0) {
            return res.status(200).json({
                images: imageArray,
            });
        } else {
            return res.status(500).json({
                message: 'No images were uploaded.',
                error: true,
                success: false,
            });
        }
    }
    catch (error) {
        console.error('Error during image upload:', error);
        return res.status(500).json({
            message: 'Internal server error during image upload',
            error: true,
            success: false,
        });
    }
};

//create product 
const createProductController = async (req, res) => {
    try {
        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            images: imageArray,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            categoryName: req.body.categoryName,
            categoryId: req.body.categoryId,
            subCategoryId: req.body.subCategoryId,
            subCategoryName: req.body.subCategoryName,
            thirdSubCategoryId: req.body.thirdSubCategoryId,
            thirdSubCategoryName: req.body.thirdSubCategoryName,
            countInStock:req.body.countInStock,
            rating:req.body.rating,
            isFeatured:req.body.isFeatured,
            discount:req.body.discount,
            size:req.body.size,
            productWeight:req.body.productWeight,

        })

        product= await product.save()
        
        if(!product){
            return res.status(500)
            .json({
                message:"product not created",
                error:true,
                success:false
            })
        }

        imageArray=[]

        return res.status(200)
        .json({
            message:"product created successfully",
            error:false,
            success:true
        })

    }
    catch (error) {
        console.error('Error during image upload:', error);
        return res.status(500).json({
            message: 'Internal server error during image upload',
            error: true,
            success: false,
        });
    }
}

export {
    uploadProductImagesController,
    createProductController
}