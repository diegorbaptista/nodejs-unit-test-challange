import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Äuthenticate User", () => {
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let usersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it("should be able to authenticate an user with valid e-mail and password", async () => {
    const password = "123456";
    const passwordHash = await hash("123456", 8);

    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: password,
    });

    expect(response.token).toBeTruthy();
    expect(response.user.id).toEqual(user.id);
  });

  it("should not be able to authenticate an user who does not exists", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "fake@example.com",
        password: "fakepassword",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able do authenticate an user with invalid password", async () => {
    const passwordHash = await hash("123456", 8);

    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "wrong password",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
