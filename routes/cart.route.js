import {Router} from 'express'
import authentication from "../middleware/auth.middleware.js";
import { addToCartItemController, deleteCartItemController, getCartItemController, updateCartItemQuantityController } from '../controllers/cart.contoller.js';

const cartRouter=Router()

cartRouter.post('/add',authentication,addToCartItemController)

cartRouter.get('/get-cartitem',authentication,getCartItemController)

cartRouter.put('/update-cartqty',authentication,updateCartItemQuantityController)

cartRouter.delete('/delete-cartitem',authentication,deleteCartItemController)

export default cartRouter
