import { getAllHotels, getRoomsByHotelId } from "@/controllers/hotels-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router()

hotelsRouter.all('/*', authenticateToken)
hotelsRouter.get('/hotels', getAllHotels)
hotelsRouter.get('/hotels/:hotelId', getRoomsByHotelId)