import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Statement Operation", () => {
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to get an statement operation", async () => {
    const fakeUser = await usersRepository.create({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "fake_password",
    });

    const fakeStatement = await statementsRepository.create({
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "Fake statement operation",
      user_id: String(fakeUser.id),
    });

    const user_id = String(fakeUser.id);
    const statement_id = String(fakeStatement.id);

    const statement = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statement.id).toEqual(fakeStatement.id);
    expect(statement.amount).toEqual(fakeStatement.amount);
    expect(statement.type).toEqual(fakeStatement.type);
  });

  it("should not be able to return an statement from a user who does not exists", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: "fake_user_id",
        statement_id: "fake_statement_id",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to return an statement who does not exists", async () => {
    const fakeUser = await usersRepository.create({
      email: "johndoe@example.com",
      name: "John Doe",
      password: "fake_password",
    });

    const user_id = String(fakeUser.id);

    await expect(
      getStatementOperationUseCase.execute({
        user_id,
        statement_id: "fake_statement_id",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
