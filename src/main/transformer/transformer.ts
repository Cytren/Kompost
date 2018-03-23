
import {getIncludes} from "./include-decorator";

export default abstract class Transformer<M> {
    public constructor (readonly includes: string[] = []) {}

    public async item (model: M): Promise<object> {
        return await this.internalTransform(model);
    }

    public async collection (models: M[]): Promise<object[]> {
        const result = [];

        for (const model of models) {
            result.push(await this.internalTransform(model));
        }

        return result;
    }

    private async internalTransform (model: M): Promise<object> {
        const includes = getIncludes(this);
        const transformed = await this.transform(model);

        for (const include of this.includes) {
            if (includes[include]) {
                await ((this[includes[include]] as any)(model, transformed));
            }
        }

        return transformed;
    }

    protected abstract async transform (model: M): Promise<object>;
}
