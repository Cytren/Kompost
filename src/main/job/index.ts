
export default interface Job {
    name: string;
    schedule: string;
    run: () => Promise<void>;
}
