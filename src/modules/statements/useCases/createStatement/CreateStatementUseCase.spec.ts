import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create Statement", () => {
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;
  let createStatementUseCase: CreateStatementUseCase;

  enum OperationType {
    DEPOSIT = "deposit",
    WITHDRAW = "withdraw",
  }

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit", async () => {
    const passwordHash = await hash("123456", 8);

    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    const statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test deposit",
    });

    expect(statement.id).toBeTruthy();
    expect(statement.type).toEqual(OperationType.DEPOSIT);
    expect(statement.user_id).toEqual(user.id);
    expect(statement.amount).toEqual(100);
  });

  it("should not be able to create an statement of a user who does not exists", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "fake_user_id",
        type: OperationType.DEPOSIT,
        amount: 10,
        description: "Fake deposit",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to make an withdraw when user does not have insuficient funds", async () => {
    const passwordHash = await hash("123456", 8);

    const user = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash,
    });

    await expect(
      createStatementUseCase.execute({
        user_id: String(user.id),
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Fake withdraw",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
