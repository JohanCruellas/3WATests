import { Executable } from "../../core/executable.interface"
import { User } from "../../user/entities/user.entity"
import { IConferenceRepository } from "../ports/conference-repository.interface"

type RequestChangeSeats = {
  user: User,
  conferenceId: string,
  seats: number
}

type ResponseChangeSeats = void

export class ChangeSeats implements Executable<RequestChangeSeats, ResponseChangeSeats>{
  constructor(private readonly repository: IConferenceRepository) {}

  async execute({user, conferenceId, seats}){
    const conference = await this.repository.findById(conferenceId)

    if(!conference) throw new Error("Conference not found")
    if(conference.props.organizerId !== user.props.id) throw new Error("You are not allowed to update this conference")
    
    conference.update({seats})

    if(conference.hasTooManySeats() || conference.doesNotHaveEnoughSeats()) throw new Error('The conference must have a maximum of 1000 seats and minimum of 20 seats')

    await this.repository.update(conference)
    
  }
}