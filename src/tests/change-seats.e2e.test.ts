import request from "supertest";
import container from "../infrastructure/express_api/config/dependency-injection";
import { IConferenceRepository } from "../conference/ports/conference-repository.interface";
import { TestApp } from "./utils/test-app";
import { Application } from "express";
import { e2eUsers } from "./seeds/user-seeds";
import { e2eConference } from "./seeds/conference-seed";
import { Booking } from "../conference/entities/booking.entity";
import { IBookingRepository } from "../conference/ports/booking-repository.interface";

describe("Feature: Change conference seats", () => {
  let testApp: TestApp;
  let app: Application;

  beforeEach(async () => {
    testApp = new TestApp();
    await testApp.setup();
    await testApp.loadAllFixtures([
      e2eUsers.johnDoe,
      e2eConference.conference1,
    ]);
    app = testApp.expressApp;
  });

  afterAll(async () => {
    await testApp.teardown();
  });

  describe("Feature: Happy Path", () => {
    it("should change conference seats", async () => {
      const seats = 100;
      const id = e2eConference.conference1.entity.props.id;

      const result = await request(app)
        .patch(`/conference/seats/${id}`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send({ seats });

      expect(result.status).toBe(200);

      const conferenceRepository = container.resolve(
        "conferenceRepository"
      ) as IConferenceRepository;
      const fetchedConference = await conferenceRepository.findById(id);

      expect(fetchedConference).toBeDefined();
      expect(fetchedConference!.props.seats).toEqual(seats);
    });
  });

  describe("User is not authorized", () => {
    it("should return 403 Unauthorized", async () => {
      const seats = 100;
      const id = e2eConference.conference1.entity.props.id;

      const result = await request(app)
        .patch(`/conference/seats/${id}`)
        .send({ seats });

      expect(result.status).toBe(403);
    });
  });

  describe("Invalid seat change", () => {
    it("should not allow fewer seats than already booked", async () => {
      const initialSeats = 100;
      const id = e2eConference.conference1.entity.props.id;

      await request(app)
        .patch(`/conference/seats/${id}`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send({ seats: initialSeats });

      const bookingRepository = container.resolve(
        "bookingRepository"
      ) as IBookingRepository;

      const bookingCount = 30;
      for (let i = 0; i < bookingCount; i++) {
        const booking = new Booking({
          conferenceId: id,
          userId: e2eUsers.johnDoe.entity.props.id,
        });

        await bookingRepository.create(booking);
      }

      const seats = 25;
      const result = await request(app)
        .patch(`/conference/seats/${id}`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send({ seats });

      expect(result.status).toBe(400);

      const conferenceRepository = container.resolve(
        "conferenceRepository"
      ) as IConferenceRepository;
      const fetchedConference = await conferenceRepository.findById(id);

      expect(fetchedConference!.props.seats).toEqual(initialSeats);
    });
  });
});
