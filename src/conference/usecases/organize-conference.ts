import { Conference } from "../entities/conference.entity";
import { User } from "../../user/entities/user.entity";
import { IDateGenerator } from "../../core/ports/date-generator.interface";
import { IIDGenerator } from "../../core/ports/id-generator.interface";
import { IConferenceRepository } from "../ports/conference-repository.interface";
import { Executable } from "../../core/executable.interface";

type OrganizeRequest = {
  user: User,
  title: string,
  startDate: Date,
  endDate: Date,
  seats: number
}

type OrganizeResponse = {
  id: string
}

export class OrganizeConference implements Executable<OrganizeRequest, OrganizeResponse>{
  constructor(
    private readonly repository: IConferenceRepository,
    private readonly idGenerator: IIDGenerator,
    private readonly dateGenerator: IDateGenerator
  ){
  }

  async execute({user, title, startDate, endDate, seats}) {
    const id = this.idGenerator.generate()
    const newConference =  new Conference({
      id,
      organizerId: user.props.id,
      title,
      startDate,
      endDate,
      seats
    })

    if(newConference.isTooClose(this.dateGenerator.now())) {
      throw new Error("The conference must happen in at least 3 days")
    }

    if(newConference.hasTooManySeats()) {
      throw new Error("The conference must not have more than 1000 seats")
    }

    if(newConference.doesNotHaveEnoughSeats()) {
      throw new Error("The conference must have at least 20 seats")
    }

    if(newConference.isTooLong()) {
      throw new Error("The conference is too long (>3h)")
    }


    await this.repository.create(newConference)

    return {id}
  }
}