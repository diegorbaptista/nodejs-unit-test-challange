import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get balance", () => {
  let fakeUser: User;
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;
  let getBalanceUseCase: GetBalanceUseCase;

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );

    fakeUser = await usersRepository.create({
      email: "johndoe@example.com",
      name: "Fake username",
      password: "fake_user_password",
    });
  });

  async function createStatement(
    amount: number,
    type: OperationType
  ): Promise<Statement> {
    const statement = await statementsRepository.create({
      amount,
      type,
      user_id: String(fakeUser.id),
      description: "Fake statement operation",
    });

    return statement;
  }

  it("it should be able to return a balance with 3 statements", async () => {
    const amounts = [100, 300, -275];
    const balanceAmount = amounts.reduce((total, value) => {
      return (total += value);
    });

    amounts.forEach((amount) => {
      createStatement(
        Math.abs(amount),
        amount >= 0 ? OperationType.DEPOSIT : OperationType.WITHDRAW
      );
    });

    const balance = await getBalanceUseCase.execute({
      user_id: String(fakeUser.id),
    });

    expect(balance.balance).toEqual(balanceAmount);
    expect(balance.statement.length).toEqual(amounts.length);
  });

  it("should be able to return an empty balance from a user who does not create any statement", async () => {
    const balance = await getBalanceUseCase.execute({
      user_id: String(fakeUser.id),
    });

    expect(balance.balance).toEqual(0);
    expect(balance.statement.length).toEqual(0);
  });

  it("should not be able to return an balance from a user who does not exists", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: "fake_user_id",
      })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
