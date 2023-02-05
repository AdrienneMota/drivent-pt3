import { prisma } from "@/config";


async function findHotels() {
  return prisma.hotel.findMany()
}

async function findRoomsById(hotelId: number) {
  return prisma.hotel.findMany({
    where: { id: hotelId  },
    include: {
        Rooms:true
    }
  })
}

const hotelRepository = {
  findHotels,
  findRoomsById
};

export default hotelRepository;