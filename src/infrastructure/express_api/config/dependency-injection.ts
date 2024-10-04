import { asClass, asValue, createContainer } from "awilix";
import { InMemoryConferenceRepository } from "../../../conference/adapters/in-memory-conference-repository";
import { RandomIDGenerator } from "../../../core/adapters/random-id-generator";
import { CurrentDateGenerator } from "../../../core/adapters/current-date-generator";
import { OrganizeConference } from "../../../conference/usecases/organize-conference";
import { BasicAuthenticator } from "../../../user/services/basic-authenticator";
import { IUserRepository } from "../../../user/ports/user-repository.interface";
import { IDateGenerator } from "../../../core/ports/date-generator.interface";
import { IIDGenerator } from "../../../core/ports/id-generator.interface";
import { IConferenceRepository } from "../../../conference/ports/conference-repository.interface";
import { ChangeSeats } from "../../../conference/usecases/change-seats";
import { MongoUserRepository } from "../../../user/adapters/mongo/mongo-user-repository";
import { MongoUser } from "../../../user/adapters/mongo/mongo-user";
import { ChangeDates } from "../../../conference/usecases/change-dates";
import { InMemoryBookingRepository } from "../../../conference/adapters/in-memory-booking-repository";
import { InMemoryMailer } from "../../../core/adapters/in-memory-mailer";
import { IBookingRepository } from "../../../conference/ports/booking-repository.interface";
import { IMailer } from "../../../core/ports/mailer.interface";

const container = createContainer()

container.register({
  conferenceRepository: asClass(InMemoryConferenceRepository).singleton(),
  idGenerator: asClass(RandomIDGenerator).singleton(),
  dateGenerator: asClass(CurrentDateGenerator).singleton(),
  userRepository: asValue(new MongoUserRepository(MongoUser.UserModel)),
  bookingRepository: asClass(InMemoryBookingRepository).singleton(),
  mailer: asClass(InMemoryMailer).singleton(),
})

const conferenceRepository = container.resolve('conferenceRepository') as IConferenceRepository
const idGenerator = container.resolve('idGenerator') as IIDGenerator
const dateGenerator = container.resolve('dateGenerator') as IDateGenerator
const userRepository = container.resolve('userRepository') as IUserRepository
const bookingRepository = container.resolve('bookingRepository') as IBookingRepository
const mailer = container.resolve('mailer') as IMailer

container.register({
  organizeConference: asValue(new OrganizeConference(conferenceRepository, idGenerator, dateGenerator)),
  changeSeats: asValue(new ChangeSeats(conferenceRepository)),
  authenticator: asValue(new BasicAuthenticator(userRepository)),
  changeDates: asValue(new ChangeDates(conferenceRepository, dateGenerator, bookingRepository, mailer, userRepository)),
})

export default container