
import Context from "../context";

export default interface Middleware {
    run (context: Context, next: () => Promise<any>);
};
