import { BaseController, UserController } from "./init";
import { TAG_METHOD } from "..";

describe("Method", () => {

  it(`BaseController should be have   [ GET /             ]`, () => {

    expect(BaseController[TAG_METHOD].get("/").get("get")).not.toBe(null);

  });

  it(`BaseController should be haven't [ POST /            ]`, () => {

    expect(BaseController[TAG_METHOD].get("/").get("post")).toBe(undefined);

  });

  it(`BaseController should be haven't [ DELETE /{uid}     ]`, () => {

    expect(BaseController[TAG_METHOD].get("/{uid}")).toBe(undefined);

  });

  it(`BaseController should be haven't [ PUT /             ]`, () => {

    expect(BaseController[TAG_METHOD].get("/").get("put")).toBe(undefined);

  });

  it(`UserController should be have   [ GET /             ]`, () => {

    expect(UserController[TAG_METHOD].get("/").get("get")).not.toBe(null);

  });

  it(`UserController should be have   [ POST /            ]`, () => {

    expect(UserController[TAG_METHOD].get("/").get("get")).not.toBe(null);

  });

  it(`UserController should be have   [ DELETE /{uid}     ]`, () => {

    expect(UserController[TAG_METHOD].get("/{uid}").get("delete")).not.toBe(null);

  });

  it(`UserController should be have   [ PUT /             ]`, () => {

    expect(UserController[TAG_METHOD].get("/").get("put")).not.toBe(null);

  });

});
