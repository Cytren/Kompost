
import Paginated from "../response/paginated";
import ResponseError from "../response/response-error";
import Response from "../response/response";

export default class Controller {

    protected where (query: object) {
        const result = {};

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) { result[key] = value; }
        });

        return result;
    }

    protected order (query: { [key: string]: string }) {
        const result = {};

        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) { result[key] = value.toUpperCase(); }
        });

        return result;
    }

    protected response (status: number, model?: any) {
        return new Response(status, model);
    }

    protected paginate (model: any[], start: number, total?: number) {
        return new Paginated(model, start, total);
    }

    protected error (status: number, model?: any) {
        throw new ResponseError(status, model);
    }

    protected checkExists (id: string, model: any) {
        if (!model) {
            this.error(404, { error: `Could not find ${id}.` });
        }
    }
}
