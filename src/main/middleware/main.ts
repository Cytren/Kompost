
import Middleware, {MiddlewareResult} from "./";
import Context from "../context";

export default class MainMiddleware implements Middleware {

    public async run (context: Context, start: () => Promise<MiddlewareResult>) {
        const { handler } = await start();
        await handler();
    }
}
