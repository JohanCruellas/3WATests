import { AwilixContainer } from "awilix";
import { IFixture } from "../utils/fixture.interface";
import { IBookingRepository } from "../../conference/ports/booking-repository.interface";
import { Booking } from "../../conference/entities/booking.entity";

export class BookingFixture implements IFixture {
  constructor(public entity: Booking) {}

  async load(container: AwilixContainer): Promise<void> {
    const repository = container.resolve('bookingRepository') as IBookingRepository
    await repository.create(this.entity)
  }
}