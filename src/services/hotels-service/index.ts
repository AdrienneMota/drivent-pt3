import { notFoundError } from "@/errors";
import { paymentRequiredError } from "@/errors/paymente-required";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";


async function getAllHotels(userId : number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
  if(!enrollment){
    throw notFoundError(); 
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id)
  if(!ticket){
    throw notFoundError(); 
  }

  if(ticket.status === TicketStatus.RESERVED){
    throw paymentRequiredError(); 
  }

  const { TicketType } = ticket
  if((TicketType.isRemote) || (!TicketType.includesHotel)){
    throw paymentRequiredError();
  }

  const hotels = await hotelRepository.findHotels()
  if (!hotels) {
    throw notFoundError();
  }

  return hotels;
}

async function getRoomslById(hotelId: number, userId: number) {
   const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
  if(!enrollment){
    throw notFoundError(); 
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id)
  if(!ticket){
    throw notFoundError(); 
  }

  if(ticket.status === TicketStatus.RESERVED){
    throw paymentRequiredError(); 
  }

  const { TicketType } = await ticketRepository.findTickeWithTypeById(ticket.id)
  if((TicketType.isRemote) || (!TicketType.includesHotel)){
    throw paymentRequiredError();
  }

  const hotel = await hotelRepository.findRoomsById(hotelId);
  if (!hotel) {
    throw notFoundError();
  }

  return hotel;
}

const hotelService = {
  getAllHotels,
  getRoomslById
};

export default hotelService;
