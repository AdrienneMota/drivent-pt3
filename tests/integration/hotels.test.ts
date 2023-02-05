import app, { init } from "@/app";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createPayment, createTicketType, createUser, createTicket, createHotel, createHotelRoom, setTicketStatusById, updateTicketType } from "../factories";
import { generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 200 with OK! text", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await updateTicketType({...ticketType, includesHotel: true, isRemote: false})
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
    const payment = await createPayment(ticket.id, ticketType.price)
    await setTicketStatusById(ticket.id)
    const hotel = await createHotel()
    const room = await createHotelRoom(hotel.id)

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toBe({
      ...hotel,
      Room: {
        ...room
      }
    });
  });
});
