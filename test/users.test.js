const app = require("../app");
const request = require("supertest");

describe("test user API", () => {
  test("get : get all users", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(200);
  });
});
