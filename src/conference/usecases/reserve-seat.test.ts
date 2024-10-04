import { ReserveSeat } from './reserve-seat';
import { InMemoryConferenceRepository } from '../adapters/in-memory-conference-repository';
import { InMemoryBookingRepository } from '../adapters/in-memory-booking-repository';
import { testConference } from '../tests/conference-seeds';
import { testUsers } from '../../user/tests/user-seeds';

describe('Feature: Reserving a seat', () => {
  let bookingRepository: InMemoryBookingRepository;
  let conferenceRepository: InMemoryConferenceRepository;
  let useCase: ReserveSeat;

  beforeEach(async () => {
    bookingRepository = new InMemoryBookingRepository();
    conferenceRepository = new InMemoryConferenceRepository();
    await conferenceRepository.create(testConference.conference1);
    useCase = new ReserveSeat(conferenceRepository, bookingRepository);
  });

  async function expectBookingExists(userId: string, conferenceId: string) {
    const bookings = await bookingRepository.findByConferenceId(conferenceId);
    expect(bookings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 
          props: { userId, conferenceId } // Updated to match the structure
        })
      ])
    );
  }

  describe('Scenario: Happy Path', () => {
    it('should reserve a seat successfully', async () => {
      await useCase.execute({
        user: testUsers.johnDoe,
        conferenceId: testConference.conference1.props.id,
      });

      await expectBookingExists(testUsers.johnDoe.props.id, testConference.conference1.props.id);
    });
  });
});
