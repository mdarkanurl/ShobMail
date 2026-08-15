import { Hono } from "hono";
import { AuthControllers } from "../controllers";
import { isAuthenticated } from "../middlewares";

const authRouter = new Hono();
const authControllers = new AuthControllers()

// routers
authRouter.post(
    '/refresh-token',
    (c) => authControllers.refreshToken(c)
);

authRouter.post(
    '/logout',
    isAuthenticated(),
    (c) => authControllers.logout(c)
);

export default authRouter;
