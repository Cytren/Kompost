
export default class Paginated <M> {
    constructor (readonly data: M[], readonly start: number, readonly total?: number) {}

    get left () {
        if (!this.total) { return; }
        return this.total - this.start - this.data.length;
    }
}
