import { Hotel, Room, Session } from "@prisma/client";
import { createUser } from "./users-factory";
import { prisma } from "@/config";

export async function createHotel(): Promise<Hotel> {
  return prisma.hotel.create({
    data: {
      name: "HotelName",
      image: " "
    },
  });
}


export async function createHotelRoom(hotelId: number): Promise<Room> {
  return prisma.room.create({
    data: {
      hotelId,
      name: "Room",
      capacity: 10
    },
  });
}