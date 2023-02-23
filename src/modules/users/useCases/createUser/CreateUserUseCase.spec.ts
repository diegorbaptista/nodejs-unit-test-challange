import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create user", () => {
  let usersRepositoryInMemory: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "1234",
    });

    expect(user).toHaveProperty("id");
    expect(user.id).toBeTruthy();
  });

  it("should not be able to create a user whose e-mail already exists", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "1234",
    });

    await expect(
      createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "1234",
      })
    ).rejects.toBeInstanceOf(CreateUserError);
  });
});
