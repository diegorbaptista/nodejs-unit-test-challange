import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show user profile", () => {
  let usersRepository: InMemoryUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to show a user profile who exists", async () => {
    const passwordHash = await hash("123456", 8);

    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    const userProfile = await showUserProfileUseCase.execute(String(user.id));

    expect(userProfile.id).toEqual(user.id);
    expect(userProfile.email).toEqual(user.email);
  });

  it("should not be able to show a profile of a user who does not exists", async () => {
    await expect(
      showUserProfileUseCase.execute("invalid_user_id")
    ).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
