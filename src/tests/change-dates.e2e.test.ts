import request from 'supertest'
import container from '../infrastructure/express_api/config/dependency-injection'
import { IConferenceRepository } from '../conference/ports/conference-repository.interface'
import { TestApp } from './utils/test-app'
import { Application } from 'express'
import { e2eUsers } from './seeds/user-seeds'
import { addDays, addHours } from 'date-fns'
import { e2eBooking } from './seeds/booking-seeds'
import { e2eConference } from './seeds/conference-seed'

describe("Feature: Change conference dates", () => {

  let testApp: TestApp
  let app: Application

  beforeEach(async () => {
    testApp = new TestApp()
    await testApp.setup()
    await testApp.loadAllFixtures([e2eUsers.johnDoe, e2eUsers.bob, e2eUsers.alice, e2eBooking.bobBooking, e2eBooking.aliceBooking, e2eConference.conference1])
    app = testApp.expressApp
  })

  afterAll(async () => {
    await testApp.teardown()
  })

  describe("Feature: Happy Path", () => {

    it('should change conference dates', async () => {
      const startDate = addDays(new Date(), 8)
      const endDate = addDays(addHours(new Date(), 2), 8)
      const id = e2eConference.conference1.entity.props.id

      const result = await request(app)
        .patch(`/conference/dates/${id}`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({ startDate: startDate.toISOString(), endDate: endDate.toISOString() })

      expect(result.status).toBe(200)

      const conferenceRepository = container.resolve('conferenceRepository') as IConferenceRepository
      const fetchedConference = await conferenceRepository.findById(id)

      expect(fetchedConference).toBeDefined()
      expect(fetchedConference!.props.startDate).toEqual(startDate.toISOString())
      expect(fetchedConference!.props.endDate).toEqual(endDate.toISOString())
    })
  })

  describe("User is not authorized", () => {

    it('should return 403 Unauthorized', async () => {
      const startDate = addDays(new Date(), 8)
      const endDate = addDays(addHours(new Date(), 2), 8)
      const id = e2eConference.conference1.entity.props.id

      const result = await request(app)
        .patch(`/conference/dates/${id}`)
        .send({ startDate, endDate })

      expect(result.status).toBe(403)
    })
  })

})