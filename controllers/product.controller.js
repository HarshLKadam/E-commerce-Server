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
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            size: req.body.size,
            productWeight: req.body.productWeight,

        })

        product = await product.save()

        if (!product) {
            return res.status(500)
                .json({
                    message: "product not created",
                    error: true,
                    success: false
                })
        }

        imageArray = []

        return res.status(200)
            .json({
                message: "product created successfully",
                error: false,
                success: true,
                product: product
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


//get all products 
const getAllProductController = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage);
        let totalPosts = await Product.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage)

        if (page > totalPages) {
            return res.status(400)
                .json({
                    message: 'page not found',
                    success: false,
                    error: true
                })
        }

        const products = await Product.find()
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return res.status(500)
                .json({
                    message: "products is not geting",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                message: "list of all products ",
                error: false,
                success: true,
                products: products,
                totalPages: totalPages,
                page: page
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

//get all products by category id 
const getAllProductByCategoryIdController = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10000;
        let totalPosts = await Product.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage)

        if (page > totalPages) {
            return res.status(400)
                .json({
                    message: 'page not found',
                    success: false,
                    error: true
                })
        }

        const products = await Product.find({ categoryId: req.query.id })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return res.status(500)
                .json({
                    message: "products is not geting",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                message: "list of all products ",
                error: false,
                success: true,
                products: products,
                totalPages: totalPages,
                page: page
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

//get all product by category name
const getAllProductByCategoryNameController = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10000;
        let totalPosts = await Product.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage)

        if (page > totalPages) {
            return res.status(400)
                .json({
                    message: 'page not found',
                    success: false,
                    error: true
                })
        }

        const products = await Product.find({ categoryName: req.query.categoryName })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return res.status(500)
                .json({
                    message: "products is not geting",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                message: "list of all products ",
                error: false,
                success: true,
                products: products,
                totalPages: totalPages,
                page: page
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

//get all product by category by sub category id 
const getAllProductBySubCategoryIdController = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10000;
        let totalPosts = await Product.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage)

        if (page > totalPages) {
            return res.status(400)
                .json({
                    message: 'page not found',
                    success: false,
                    error: true
                })
        }

        const products = await Product.find({ subCategoryId: req.query.subCategoryId })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return res.status(500)
                .json({
                    message: "products is not geting",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                message: "list of all products ",
                error: false,
                success: true,
                products: products,
                totalPages: totalPages,
                page: page
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


//get all product by category by sub category name 
const getAllProductBySubCategoryNameController = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10000;
        let totalPosts = await Product.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage)

        if (page > totalPages) {
            return res.status(400)
                .json({
                    message: 'page not found',
                    success: false,
                    error: true
                })
        }

        const products = await Product.find({ subCategoryName: req.query.subCategoryName })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return res.status(500)
                .json({
                    message: "products is not geting",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                message: "list of all products ",
                error: false,
                success: true,
                products: products,
                totalPages: totalPages,
                page: page
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

// get all product by price 
const getAllProductByPriceController = async (req, res) => {
    try {
        let productList = []

        if (req.query.categoryId !== "" && req.query.categoryId !== undefined) {
            const productListArray = await Product.find({
                categoryId: req.query.categoryId,
            }).populate("category")

            productList = productListArray

        }

        if (req.query.subCategoryId !== "" && req.query.subCategoryId !== undefined) {
            const productListArray = await Product.find({
                subCategoryId: req.query.subCategoryId,
            }).populate("category")

            productList = productListArray

        }

        const filteredProducts = productList.filter((product) => {
            if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
                return false
            }
            if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
                return false
            }
            return true
        })

        return res.status(200)
            .json({
                message: "filtered products ",
                products: filteredProducts,
                totalPages: 0,
                page: 0,
                error: false,
                success: true
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

// get all product by rating
const getAllProductByRatingController = async (req, res) => {
    try {

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10000;
        let totalPosts = await Product.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage)

        if (page > totalPages) {
            return res.status(400)
                .json({
                    message: 'page not found',
                    success: false,
                    error: true
                })
        }

        let products = []
        if (req.query.categoryId !== undefined) {
            products = await Product.find({
                rating: req.query.rating,
                categoryId: req.query.categoryId,
            })
                .populate('category')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (req.query.subCategoryId !== undefined) {
            products = await Product.find({
                rating: req.query.rating,
                subCategoryId: req.query.subCategoryId,
            })
                .populate('category')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        if (!products) {
            return res.status(500)
                .json({
                    message: "products is not geting",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                message: "list of all products ",
                error: false,
                success: true,
                products: products,
                totalPages: totalPages,
                page: page
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
    createProductController,
    getAllProductController,
    getAllProductByCategoryIdController,
    getAllProductByCategoryNameController,
    getAllProductBySubCategoryIdController,
    getAllProductBySubCategoryNameController,
    getAllProductByPriceController,
    getAllProductByRatingController
}