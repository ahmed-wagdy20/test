import morgan from "morgan";
import fs from "fs";
import path from "path";
const __dirName = path.resolve()
export function attachRoutingWithLogger(app, routerPath, fileName) {
    
    const logStream = fs.createWriteStream(path.join(__dirName, "./src/logs", fileName),{
        flags:"a"
    })

    app.use(routerPath, morgan("combined", { stream: logStream }))


}