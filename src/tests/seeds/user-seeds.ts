import { User } from "../../user/entities/user.entity";
import { UserFixture } from "../fixtures/user-fixture";

export const e2eUsers = {
  johnDoe: new UserFixture(
    new User({
      id: 'john-doe',
      emailAddress:  'johndoe@yopmail.com',
      password: 'qwerty'
    })
  ),
  bob: new UserFixture(
    new User({
      id: 'bob',
      emailAddress:  'bob@yopmail.com',
      password: 'qwerty'
    })
  ),
  alice: new UserFixture(
    new User({
      id: 'alice',
      emailAddress:  'alice@yopmail.com',
      password: 'qwerty'
    })
  )
}