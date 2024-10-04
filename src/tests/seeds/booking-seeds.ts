import { Booking } from "../../conference/entities/booking.entity";
import { testUsers } from "../../user/tests/user-seeds";
import { BookingFixture } from "../fixtures/booking-fixture";
import { e2eConference } from "./conference-seed";


export const e2eBooking = {
  bobBooking: new BookingFixture(
    new Booking({
    userId: testUsers.bob.props.id,
    conferenceId: e2eConference.conference1.entity.props.id
  })
),
  aliceBooking: new BookingFixture(
    new Booking({
      userId: testUsers.alice.props.id,
      conferenceId: e2eConference.conference1.entity.props.id
    })
  )
}