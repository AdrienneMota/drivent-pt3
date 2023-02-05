import { getAllHotels, getRoomsByHotelId } from "@/controllers/hotels-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router()

hotelsRouter.all('/*', authenticateToken)
hotelsRouter.get('/', getAllHotels)
hotelsRouter.get('/:hotelId', getRoomsByHotelId)

export default hotelsRouter