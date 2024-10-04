import { Model } from "mongoose";
import { TestApp } from "../../../tests/utils/test-app";
import { MongoConference } from "./mongo-conference";
import { MongoConferenceRepository } from "./mongo-conference-repository";
import { Conference } from "../../entities/conference.entity";
import { testConference } from "../../tests/conference-seeds";

describe("MongoConferenceRepository", () => {
  let app: TestApp;
  let model: Model<MongoConference.ConferenceDocument>;
  let repository: MongoConferenceRepository;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();

    model = MongoConference.ConferenceModel;
    await model.deleteMany({});
    repository = new MongoConferenceRepository(model);

    const conferenceRecord = new model({
      _id: testConference.conference1.props.id,
      organizerId: testConference.conference1.props.organizerId,
      title: testConference.conference1.props.title,
      startDate: testConference.conference1.props.startDate,
      endDate: testConference.conference1.props.endDate,
      seats: testConference.conference1.props.seats,
    });

    await conferenceRecord.save();
  });

  afterEach(async () => {
    await app.teardown();
  });

  describe("Scenario: findById", () => {
    it("should find the conference corresponding to the id", async () => {
      const conference = await repository.findById(
        testConference.conference1.props.id
      );
      expect(conference?.props).toEqual(testConference.conference1.props);
    });

    it("should return null if no conference found", async () => {
      const conference = await repository.findById("non-existing-id");
      expect(conference).toBeNull();
    });
  });

  describe("Scenario: Create a conference", () => {
    it("should create a conference", async () => {
      await repository.create(testConference.conference2);
      const fetchedConference = await model.findOne({
        _id: testConference.conference2.props.id,
      });

      expect(fetchedConference?.toObject()).toEqual({
        _id: testConference.conference2.props.id,
        organizerId: testConference.conference2.props.organizerId,
        title: testConference.conference2.props.title,
        startDate: testConference.conference2.props.startDate,
        endDate: testConference.conference2.props.endDate,
        seats: testConference.conference2.props.seats,
        __v: 0,
      });
    });
  });

  describe("Scenario: update conference", () => {
    it("should update the conference correctly", async () => {
      const updatedConference = new Conference({
        id: testConference.conference1.props.id,
        organizerId: testConference.conference1.props.organizerId,
        title: "Updated Title",
        startDate: testConference.conference1.props.startDate,
        endDate: testConference.conference1.props.endDate,
        seats: 200,
      });

      await repository.update(updatedConference);
      const fetchedConference = await model.findOne({
        _id: testConference.conference1.props.id,
      });

      expect(fetchedConference?.toObject()).toEqual({
        _id: updatedConference.props.id,
        organizerId: updatedConference.props.organizerId,
        title: updatedConference.props.title,
        startDate: updatedConference.props.startDate,
        endDate: updatedConference.props.endDate,
        seats: updatedConference.props.seats,
        __v: 0,
      });
    });

    it("should throw an error when trying to update a non-existing conference", async () => {
      const nonExistingConference = new Conference({
        id: "non-existing-id",
        organizerId: "some-organizer-id",
        title: "Non-existing Conference",
        startDate: new Date(),
        endDate: new Date(),
        seats: 100,
      });

      await expect(repository.update(nonExistingConference)).rejects.toThrow(
        "Conference not found"
      );
    });
  });
});
