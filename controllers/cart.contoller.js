import CartProduct from "../models/cartProduct.model.js";
import User from "../models/user.model.js";

const addToCartItemController = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        // Validate inputs
        if (!userId) {
            return res.status(400).json({
                message: "User ID is missing.",
                error: true,
                success: false,
            });
        }

        if (!productId) {
            return res.status(400).json({
                message: "Provide a valid product ID.",
                error: true,
                success: false,
            });
        }

        // Check if item is already in the cart
        const checkItemCart = await CartProduct.findOne({
            userId: userId,
            productId: productId,
        });

        if (checkItemCart) {
            return res.status(400).json({
                message: "Item already in cart.",
                error: true,
                success: false,
            });
        }

        // Create a new cart item
        const cartItem = new CartProduct({
            quantity: 1,
            userId: userId,
            productId: productId,
        });

        const save = await cartItem.save();

        // Update user's shopping cart safely without duplicates
        const userUpdateResult = await User.updateOne(
            { _id: userId, shopping_cart: { $ne: productId } }, // Add only if not already present
            {
                $push: {
                    shopping_cart: productId,
                },
            }
        );

        if (userUpdateResult.nModified === 0) {
            return res.status(400).json({
                message: "Item already exists in the user's shopping cart.",
                error: true,
                success: false,
            });
        }

        return res.status(200).json({
            message: "Item added successfully.",
            error: false,
            success: true,
            data: save,
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({
            message: error.message || "An internal server error occurred.",
            error: true,
            success: false,
        });
    }
};


const getCartItemController = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is missing",
                error: true,
                success: false,
            });
        }

        const cartItem = await CartProduct.find({ userId: userId }).populate("productId");

        if (cartItem.length === 0) {
            return res.status(404).json({
                message: "No items in the cart",
                error: true,
                success: false,
            });
        }

        return res.status(200).json({
            data: cartItem,
            message: "Cart items retrieved successfully",
            error: false,
            success: true,
        });
    }
    catch (error) {
        console.error("Error fetching cart items:", error);
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

const updateCartItemQuantityController = async (req, res) => {
    try {
        const userId = req.userId
        const { _id, quantity } = req.body

        if (!_id || !quantity) {
            return res.status(402)
                .json({
                    message: "please provide id and quantity",
                    error: true,
                    success: false
                })
        }

        const updateCartItem = await CartProduct.findByIdAndUpdate(
            {
                _id: _id,
                userId: userId
            },
            {
                quantity
            }
        )

        return res.status(200)
            .json({
                message: "cart updated successfully",
                error: false,
                success: true,
                data: updateCartItem
            })
    }
    catch (error) {
        console.error("Error fetching cart items:", error);
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
};

const deleteCartItemController = async (req, res) => {
    try {
        const userId = req.userId;
        const { _id, productId } = req.body;

        console.log(_id)
        console.log(productId)
        // Validate inputs
        if (!_id || !productId) {
            return res.status(400).json({
                message: "Please provide both item ID and product ID.",
                error: true,
                success: false,
            });
        }
      
        const deleteCartItem = await CartProduct.deleteOne({
            _id: _id,
            userId: userId,
        });

        if (!deleteCartItem.deletedCount) {
            return res.status(404).json({
                message: "The product in the cart is not found.",
                error: true,
                success: false,
            });
        }

        // Fetch the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                error: true,
                success: false,
            });
        }

      
        const updatedCart = user.shopping_cart.filter(item => item !== productId);

        if (updatedCart.length === user.shopping_cart.length) {
            return res.status(400).json({
                message: "Product not found in user's shopping cart.",
                error: true,
                success: false,
            });
        }

        user.shopping_cart = updatedCart;

        // Save the updated user document
        await user.save();

        return res.status(200).json({
            message: "Item removed successfully from shopping cart",
            error: false,
            success: true,
        });
    } 
    catch (error) {
        console.error("Error deleting cart item:", error);
        return res.status(500).json({
            message: error.message || "An internal server error occurred.",
            error: true,
            success: false,
        });
    }
};


export {
    addToCartItemController,
    getCartItemController,
    updateCartItemQuantityController,
    deleteCartItemController
}