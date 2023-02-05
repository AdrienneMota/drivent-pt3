import { notFoundError } from "@/errors";
import { paymentRequiredError } from "@/errors/paymente-required";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { PAYMENT_REQUIRED } from "http-status";


async function getAllHotels(userId : number) {
  const hotels = await hotelRepository.findHotels()
  if (!hotels) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findById(userId)
  if(!enrollment){
    throw notFoundError(); 
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id)
  if(!ticket){
    throw notFoundError(); 
  }

  if(ticket.status === 'RESERVED'){
    throw paymentRequiredError(); 
  }

  const { TicketType } = await ticketRepository.findTickeWithTypeById(ticket.id)
  if((TicketType.isRemote) || (!TicketType.includesHotel)){
    throw paymentRequiredError();
  }

  return hotels;
}

async function getRoomslById(hotelId: number, userId: number) {
  const hotel = await hotelRepository.findRoomsById(hotelId);
  if (!hotel) {
    throw notFoundError();
  }

   const enrollment = await enrollmentRepository.findById(userId)
  if(!enrollment){
    throw notFoundError(); 
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id)
  if(!ticket){
    throw notFoundError(); 
  }

  if(ticket.status === 'RESERVED'){
    throw paymentRequiredError(); 
  }

  const { TicketType } = await ticketRepository.findTickeWithTypeById(ticket.id)
  if((TicketType.isRemote) || (!TicketType.includesHotel)){
    throw paymentRequiredError();
  }

  return hotel;
}

const hotelService = {
  getAllHotels,
  getRoomslById
};

export default hotelService;
