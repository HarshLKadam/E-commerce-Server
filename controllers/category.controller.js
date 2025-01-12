import Category from "../models/category.model.js";

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true
});


var imageArray = [];
const uploadImagesController = async (req, res) => {
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

//create category
const createCategoryController = async (req, res) => {
    try {

        let category = new Category({
            name: req.body.name,
            images: imageArray,
            parentCategoryId: req.body.parentCategoryId,
            parentCategoryName: req.body.parentCategoryName
        })

        if (!category) {
            return res.status(500)
                .json({
                    message: "category not created",
                    error: true,
                    success: false
                })
        }

        category = await category.save();

        imageArray = []

        return res.status(200).json({
            message: "category created successfully",
            error: false,
            success: true,
            category: category
        });

    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

//get all categories
const getCategoryController = async (req, res) => {
    try {
        const categrory = await Category.find()

        const categroryMap = {}
        categrory.forEach(categorie => {
            categroryMap[categorie._id] = { ...categorie._doc, children: [] };
        })

        const rootcategories = []
        categrory.forEach(categorie => {
            if (categorie.parentCategoryId) {
                categroryMap[categorie.parentCategoryId].children.push(categroryMap[categorie._id]);
            }
            else {
                rootcategories.push(categroryMap[categorie._id])
            }
        })

        return res.status(200)
            .json({
                message: "categories created successfully",
                error: false,
                success: true,
                data: rootcategories
            })
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

//get category count 
const getCategoryCountController = async (req, res) => {
    try {
        const categoryCount = await Category.countDocuments({
            parentCategoryId: undefined
        })

        if (!categoryCount) {
            res.status(500)
                .json({
                    error: true,
                    success: false
                })
        }
        else {
            res.send({
                categoryCount: categoryCount
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

//get sub category count
const getSubCategoryCountController = async (req, res) => {
    try {
        const subCategoryCount = await Category.find();

        if (!subCategoryCount) {
            return res.status(400).json({
                error: true,
                success: false
            });
        } else {
            const subCategoryList = [];
            for (let categorie of subCategoryCount) {
                if (categorie.parentCategoryId !== undefined) {
                    subCategoryList.push(categorie);
                }
            }

            // Move the return statement here to avoid issues
            return res.send({
                subCategoryCount: subCategoryList.length
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

//get single category by id 
const getSingleCategoryCountController = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)

        if (!category) {
            return res.status(500)
                .json({
                    message: "The Category with given id is not found ",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                category: category,
                error: false,
                success: true
            })
    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

const removeImageFromCloudinary = async (req, res) => {
    try {
        const imgUrl = req.query.img;
        const urlArray = imgUrl.split('/');
        const image = urlArray[urlArray.length - 1];
        const imageName = image.split('.')[0];

        console.log("Extracted Image Name:", imageName);

        if (imageName) {
            const response = await cloudinary.uploader.destroy(imageName);

            if (response.result === 'ok') {
                return res.status(200).send({
                    message: "Image deleted successfully",
                    success: true
                });
            } else {
                return res.status(400).send({
                    message: "Failed to delete image",
                    result: response,
                    success: false
                });
            }
        }
        else {
            return res.status(400).send({
                message: "Invalid image name",
                success: false
            });
        }
    }
    catch (error) {
        console.error('Error during image deletion:', error);
        return res.status(500).json({
            message: 'Internal server error during deleting image',
            error: true,
            success: false
        });
    }
};

const deleteCategoryController = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        const images = category.images

        for (img of images) {
            const imageUrl = img;
            const urlArray = imageUrl.split('/')
            const image = urlArray[urlArray.length - 1];

            const imageName = image.split('.')[0];

            if (imageName) {
                cloudinary.uploader.destroy(
                    imageName,
                    (error, result) => {
                        console.log(error, result)
                    }
                )
            }

        }

        //finding the sub category
        const subCategory = await Category.find({
            parentCategoryId: req.params.id
        })

        for (let i = 0; i < subCategory.length; i++) {
            console.log(subCategory[i]._id);

            const thirdSubCategory = await Category.find({
                parentCategoryId: subCategory[i]._id
            })

            for (let i = 0; i < thirdSubCategory.length; i++) {
                const deletedSubCategory = await Category.findByIdAndDelete(thirdSubCategory[i]._id)
            }

            const deletedSubCategory = await Category.findByIdAndDelete(subCategory[i]._id)
        }

        const deleteCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deleteCategory) {
            return res.status(400)
                .json({
                    message: "category not found",
                    error: true,
                    success: false
                })
        }

        return res.status(200)
            .json({
                message: "category deleted successfully",
                error: false,
                success: true
            })

    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

const updateCategoryController = async (req, res) => {
    try {
       
        let category = await Category.findByIdAndUpdate(
            req.params.id,
            {
            name: req.body.name,
            images: imageArray.length > 0 ? imageArray[0] : req.body.images,
            parentCategoryId: req.body.parentCategoryId,
            parentCategoryName: req.body.parentCategoryName
        }, {
        new :true
    })

        if(!category){
            return res.status(500)
            .json({
                message:"category cannot be updated",
                error:true,
                success:false
            })
        }

        imageArray=[]

        return res.status(200)
        .json({
            message:"category updated",
            error:false,
            success:true,
            category:category
        })

    }
    catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}



export {
    uploadImagesController,
    createCategoryController,
    getCategoryController,
    getCategoryCountController,
    getSubCategoryCountController,
    getSingleCategoryCountController,
    removeImageFromCloudinary,
    deleteCategoryController,
    updateCategoryController
}

