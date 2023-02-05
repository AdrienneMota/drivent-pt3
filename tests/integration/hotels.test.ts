import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createPayment, createTicketType, createUser, createTicket, createHotel, createHotelRoom, setTicketStatusById, updateTicketType } from "../factories";
import { generateValidToken } from "../helpers";
import { cleanDb } from "../helpers";
import * as jwt from "jsonwebtoken";


beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  const path = "/hotels"

  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post(path);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post(path).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post(path).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {

    it("should respond with status 404 when user doesnt have enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server
        .get(path)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user)

      const response = await server
        .get(path)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user ticket is not paid yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

      const response = await server
        .get(path)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    

    it("should respond with status 404 when user ticket type is remote yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({ ...ticketType, isRemote: true, includesHotel: false })
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

      const response = await server
        .get(path)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    

    it("should respond with status 404 when user ticket type don't includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({ ...ticketType, isRemote: false, includesHotel: false })
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

      const response = await server
        .get(path)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });



    it("should respond with status 202 when there is no hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({...ticketType, includesHotel: true, isRemote: false})
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
      await createPayment(ticket.id, ticketType.price)
      await setTicketStatusById(ticket.id)
  
      const response = await server.get(path).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([])
    });

    it("should respond with status 200 with correct hotel data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({...ticketType, includesHotel: true, isRemote: false})
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
      await createPayment(ticket.id, ticketType.price)
      await setTicketStatusById(ticket.id)
      const hotel = await createHotel()
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([{
        ...hotel,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString()
      }]);
    });
  });
});


describe("GET /hotels/:hotelId", () => {
  const path = "/hotels"

  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post(`${path}/1`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post(`${path}/1`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post(`${path}/1`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {

    it("should respond with status 404 when user doesnt have enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server
        .get(`${path}/1`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user)

      const response = await server
        .get(`${path}/12323`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user ticket is not paid yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

      const response = await server
        .get(`${path}/121312`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    

    it("should respond with status 404 when user ticket type is remote yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({ ...ticketType, isRemote: true, includesHotel: false })
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

      const response = await server
        .get(`${path}/1`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    

    it("should respond with status 404 when user ticket type don't includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({ ...ticketType, isRemote: false, includesHotel: false })
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

      const response = await server
        .get(`${path}/1`)
        .set("Authorization", `Bearer ${token}`)

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 when hotel is not found", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({...ticketType, includesHotel: true, isRemote: false})
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
      await createPayment(ticket.id, ticketType.price)
      await setTicketStatusById(ticket.id)
  
      const response = await server.get(`${path}/13405`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 with correct hotel data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await updateTicketType({...ticketType, includesHotel: true, isRemote: false})
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)
      await createPayment(ticket.id, ticketType.price)
      await setTicketStatusById(ticket.id)
      const hotel = await createHotel()
      const room = await createHotelRoom(hotel.id)
  
      const response = await server.get(`${path}/${hotel.id}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        ...hotel,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [{
          ...room,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString()
        }]
      });
    });
  });
});
