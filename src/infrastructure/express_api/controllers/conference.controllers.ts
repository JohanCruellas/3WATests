import { NextFunction, Request, Response } from "express";
import {
  changeConferenceDatesInput,
  changeConferenceSeatsInput,
  createConferenceInput,
} from "../dto/conference.dto";
import { ValidatorRequest } from "../utils/validate-request";
import { AwilixContainer } from "awilix";
import { ChangeSeats } from "../../../conference/usecases/change-seats";
import { ChangeDates } from "../../../conference/usecases/change-dates";
import { OrganizeConference } from "../../../conference/usecases/organize-conference";
import { IConferenceRepository } from "../../../conference/ports/conference-repository.interface";
import { IBookingRepository } from "../../../conference/ports/booking-repository.interface";
import { ReserveSeat } from "../../../conference/usecases/reserve-seat";

export const organizeConference = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as createConferenceInput;

      const { errors, input } = await ValidatorRequest(
        createConferenceInput,
        body
      );

      if (errors) {
        return res.jsonError(errors, 400);
      }

      const result = await (
        container.resolve("organizeConference") as OrganizeConference
      ).execute({
        user: req.user,
        title: input.title,
        startDate: input.startDate,
        endDate: input.endDate,
        seats: input.seats,
      });

      return res.jsonSuccess(result, 201);
    } catch (error) {
      next(error);
    }
  };
};

export const changeConferenceSeats = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const body = req.body as changeConferenceSeatsInput;

      const { errors, input } = await ValidatorRequest(
        changeConferenceSeatsInput,
        body
      );
      if (errors) {
        return res.status(400).json({ message: "Validation errors", errors });
      }

      const conferenceRepository = container.resolve(
        "conferenceRepository"
      ) as IConferenceRepository;
      const bookingRepository = container.resolve(
        "bookingRepository"
      ) as IBookingRepository;

      const conference = await conferenceRepository.findById(id);
      if (!conference) {
        return res.status(404).json({ message: "Conference not found" });
      }

      const bookings = await bookingRepository.findByConferenceId(id);
      const bookedSeats = bookings.length;

      const requestedSeats = input.seats;

      if (requestedSeats < bookedSeats) {
        return res.status(400).json({
          message: `Cannot set the number of seats to ${requestedSeats}. There are already ${bookedSeats} seats booked.`,
        });
      }

      await (container.resolve("changeSeats") as ChangeSeats).execute({
        user: req.user,
        conferenceId: id,
        seats: requestedSeats,
      });

      return res
        .status(200)
        .json({ message: "The number of seats was changed correctly" });
    } catch (error) {
      next(error);
    }
  };
};

export const changeConferenceDates = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const body = req.body as changeConferenceDatesInput;

      const { errors, input } = await ValidatorRequest(
        changeConferenceDatesInput,
        body
      );

      if (errors) {
        return res.jsonError(errors, 400);
      }

      await (container.resolve("changeDates") as ChangeDates).execute({
        user: req.user,
        conferenceId: id,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      return res.jsonSuccess(
        { message: "The dates of the conference were updated correctly" },
        200
      );
    } catch (error) {
      next(error);
    }
  };
};

export const reserveSeat = (container) => {
  const bookingRepository = container.resolve(
    "bookingRepository"
  ) as IBookingRepository;
  const conferenceRepository = container.resolve(
    "conferenceRepository"
  ) as IConferenceRepository;

  return async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const conferenceId = req.params.id;

      await new ReserveSeat(conferenceRepository, bookingRepository).execute({
        user,
        conferenceId,
      });

      return res.status(200).json({ message: "Seat reserved successfully" });
    } catch (error) {
      console.error("Error reserving seat:", error);

      if (error.message === "Conference not found") {
        return res.status(404).json({ message: "Conference not found" });
      }

      if (error.message === "You already reserved a seat for this conference") {
        return res
          .status(400)
          .json({ message: "You already reserved a seat for this conference" });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
