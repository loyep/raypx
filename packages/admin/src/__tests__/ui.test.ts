import { describe, expect, it } from "vitest";
import { getUsersColumns, UserEditDialog, UsersTable } from "../ui";

describe("admin ui exports", () => {
  it("exports component factories", () => {
    expect(typeof UsersTable).toBe("function");
    expect(typeof UserEditDialog).toBe("function");
    expect(typeof getUsersColumns).toBe("function");
  });
});
