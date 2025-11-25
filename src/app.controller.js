import { connectionDB } from "./DB/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import messagesRouter from "./modules/messages/messages.controller.js"
import cors from "cors";
import path from "path"
import { attachRoutingWithLogger } from "./utils/logger/logs.js";
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit'
//hi
const bootstrap = async (app, express) => {
    //global-middleware
    app.use(express.json());
    app.use(cors());
    app.use(helmet());

    //logger
    attachRoutingWithLogger(app, "/api/auth", "auth.log");
    attachRoutingWithLogger(app, "/api/user", "user.log");
    attachRoutingWithLogger(app, "/api/messages", "messages.log");

    //db-connection
    await connectionDB();


    // const limiter = rateLimit({
    //     windowMs: 60 * 1000,
    //     limit: 3,
    //     statusCode: 429,
    //     message: `too many requests please try again later`,
    //     legacyHeaders:false

    // });

    // app.use(limiter)

    //static-service
    app.use("/uploads", express.static(path.resolve("./src/uploads")));

    //routing
    app.use("/api/auth", authRouter)
    app.use("/api/user", userRouter)
    app.use("/api/messages", messagesRouter)


    app.all("/*dummy", (req, res, next) => {
        return next(new Error("not found handler!!!", { cause: 500 }))
    })

    //global-error-handler
    app.use((error, req, res, next) => {
        const status = error.cause || 500;
        return res.status(status).json({
            message: `some thing went wrong`,
            error: error.message,
            stack: error.stack
        })
    });


};




export default bootstrap;