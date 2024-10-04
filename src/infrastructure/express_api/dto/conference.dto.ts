import { IsDateString, IsNotEmpty, IsNumber, IsObject, isString, IsString } from "class-validator"

export class createConferenceInput {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber()
  @IsNotEmpty()
  seats: number

  @IsDateString()
  @IsNotEmpty()
  startDate: Date

  @IsDateString()
  @IsNotEmpty()
  endDate: Date
}

export class changeConferenceSeatsInput {

  @IsNumber()
  @IsNotEmpty()
  seats: number

}

export class changeConferenceDatesInput {

  @IsDateString()
  @IsNotEmpty()
  startDate: Date

  @IsDateString()
  @IsNotEmpty()
  endDate: Date
}