import request from "supertest";
import container from "../infrastructure/express_api/config/dependency-injection";
import { IConferenceRepository } from "../conference/ports/conference-repository.interface";
import { TestApp } from "./utils/test-app";
import { Application } from "express";
import { e2eUsers } from "./seeds/user-seeds";
import { e2eConference } from "./seeds/conference-seed";
import { Booking } from "../conference/entities/booking.entity";
import { IBookingRepository } from "../conference/ports/booking-repository.interface";

describe("Feature: Reserve a seat", () => {
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
    it("should reserve a seat successfully", async () => {
      const conferenceId = e2eConference.conference1.entity.props.id;

      const result = await request(app)
        .post(`/conference/reserve/${conferenceId}`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send();

      expect(result.status).toBe(200);
      expect(result.body.message).toBe("Seat reserved successfully");

      const bookingRepository = container.resolve(
        "bookingRepository"
      ) as IBookingRepository;
      const bookings = await bookingRepository.findByConferenceId(conferenceId);
      expect(bookings).toHaveLength(1);
      expect(bookings[0].props.userId).toBe(e2eUsers.johnDoe.entity.props.id);
      expect(bookings[0].props.conferenceId).toBe(conferenceId);
    });
  });

  describe("User is not authorized", () => {
    it("should return 403 Unauthorized", async () => {
      const conferenceId = e2eConference.conference1.entity.props.id;

      const result = await request(app)
        .post(`/conference/reserve/${conferenceId}`)
        .send();

      expect(result.status).toBe(403);
    });
  });

  describe("Invalid reservation scenarios", () => {
    it("should return 404 for non-existing conference", async () => {
      const result = await request(app)
        .post(`/conference/reserve/non-existing-id`)
        .set("Authorization", e2eUsers.johnDoe.createAuthorizationToken())
        .send();

      expect(result.status).toBe(404);
      expect(result.body.message).toBe("Conference not found");
    });
  });
});
