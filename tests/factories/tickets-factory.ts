import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { TicketStatus, TicketType } from "@prisma/client";

export async function createTicketType() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: faker.datatype.boolean(),
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function updateTicketType(ticketType: TicketType) {
  return prisma.ticketType.update({
    where: {
      id: ticketType.id,
    },
    data: {
      ...ticketType
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export async function setTicketStatusById(ticketId: number) {
  return prisma.ticket.update({
    where: { id : ticketId},
    data: { status: TicketStatus.PAID }
  });
}