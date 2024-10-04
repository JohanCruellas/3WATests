import { IIDGenerator } from "../ports/id-generator.interface";

export class FixedIdGenerator implements IIDGenerator{
  generate(): string {
      return 'id-1'
  }
}