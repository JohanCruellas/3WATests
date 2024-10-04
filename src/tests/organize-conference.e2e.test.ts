import { addDays, addHours } from 'date-fns'
import request from 'supertest'
import container from '../infrastructure/express_api/config/dependency-injection'
import { IConferenceRepository } from '../conference/ports/conference-repository.interface'
import { TestApp } from './utils/test-app'
import { Application } from 'express'
import { e2eUsers } from './seeds/user-seeds'

describe("Feature: Organize conference", () => {

  let testApp: TestApp
  let app: Application

  beforeEach(async () => {
    testApp = new TestApp()
    await testApp.setup()
    await testApp.loadAllFixtures([e2eUsers.johnDoe])
    app = testApp.expressApp
  })
  
  afterAll(async () => {
    await testApp.teardown()
  })

  it('should organize a conference', async () => {
    const startDate = addDays(new Date(), 4)
    const endDate = addDays(addHours(new Date(), 2), 4)


    const result = await request(app)
      .post('/conference')
      .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
      .send({
        title: "My first conference",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        seats: 100,
      })

    expect(result.status).toBe(201)
    expect(result.body.data).toEqual({ id: expect.any(String) })

    const conferenceRepository = container.resolve('conferenceRepository') as IConferenceRepository
    const fetchedConference = await conferenceRepository.findById(result.body.data.id)

    expect(fetchedConference).toBeDefined()
    expect(fetchedConference?.props).toEqual({
      id: result.body.data.id,
      organizerId: e2eUsers.johnDoe.entity.props.id,
      title: "My first conference",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      seats: 100
    })
  })
})