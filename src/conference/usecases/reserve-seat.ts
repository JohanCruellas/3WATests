import { IConferenceRepository } from "../ports/conference-repository.interface";
import { IBookingRepository } from "../ports/booking-repository.interface";
import { Booking } from "../entities/booking.entity";
import { User } from "../../user/entities/user.entity"; 

interface ReserveSeatInput {
  user: User; 
  conferenceId: string; 
}

export class ReserveSeat {
  constructor(
    private conferenceRepository: IConferenceRepository,
    private bookingRepository: IBookingRepository
  ) {}

  async execute({ user, conferenceId }: ReserveSeatInput): Promise<void> {
    const conference = await this.conferenceRepository.findById(conferenceId);
    if (!conference) {
      throw new Error("Conference not found");
    }

    const existingBookings = await this.bookingRepository.findByConferenceId(conferenceId);

    const totalSeats = conference.props.seats;
    const bookedSeats = existingBookings.length;

    if (bookedSeats >= totalSeats) {
      throw new Error("No more seats available for this conference");
    }

    const booking = new Booking({
      userId: user.props.id,
      conferenceId: conferenceId,
    });

    await this.bookingRepository.create(booking);
  }
}
