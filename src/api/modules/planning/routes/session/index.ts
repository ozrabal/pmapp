import { Hono } from "hono";
import getSession from "./getSession";
import deleteSession from "./deleteSession";

const sessionRoutes = new Hono();

sessionRoutes.route("/", getSession);
sessionRoutes.route("/", deleteSession);

export default sessionRoutes;
