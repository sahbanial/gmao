import { prisma } from "@gmao/database";
import { ValidationPipe, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import request from "supertest";
import { AppModule } from "../src/app.module";
import type { AuthResult } from "../src/auth/auth-result.interface";
import type { PublicUser } from "../src/users/public-user.interface";

const TEST_EMAIL: string = "auth-e2e@gmao.local";
const TEST_EMPLOYEE_CODE: string = "AUTH-E2E";
const TEST_PASSWORD: string = "SecurePassword123!";
const TEST_JWT_SECRET: string = "auth-e2e-test-secret";

describe("AuthController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async (): Promise<void> => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    const passwordHash: string = await bcrypt.hash(TEST_PASSWORD, 4);
    await prisma.user.upsert({
      where: { email: TEST_EMAIL },
      create: {
        employeeCode: TEST_EMPLOYEE_CODE,
        firstName: "Auth",
        lastName: "Tester",
        email: TEST_EMAIL,
        passwordHash,
        role: "ADMIN",
      },
      update: {
        passwordHash,
        role: "ADMIN",
        isActive: true,
      },
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async (): Promise<void> => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await app.close();
    await prisma.$disconnect();
  });

  it("POST /auth/login returns a token and public user", async (): Promise<void> => {
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(201);
    const result: AuthResult = response.body as AuthResult;
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.user).toMatchObject({
      employeeCode: TEST_EMPLOYEE_CODE,
      email: TEST_EMAIL,
      role: "ADMIN",
    });
    expect(result.user).not.toHaveProperty("passwordHash");
  });

  it("GET /auth/me returns the authenticated user", async (): Promise<void> => {
    const loginResponse: request.Response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(201);
    const loginResult: AuthResult = loginResponse.body as AuthResult;
    const response: request.Response = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${loginResult.accessToken}`)
      .expect(200);
    const user: PublicUser = response.body as PublicUser;
    expect(user).toMatchObject({
      employeeCode: TEST_EMPLOYEE_CODE,
      email: TEST_EMAIL,
      role: "ADMIN",
    });
  });

  it("rejects invalid credentials", async (): Promise<void> => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: TEST_EMAIL, password: "WrongPassword123!" })
      .expect(401);
  });

  it("rejects requests without a bearer token", async (): Promise<void> => {
    await request(app.getHttpServer()).get("/auth/me").expect(401);
  });
});
