
import Environment from "../context/environment";
import Job from "./";
import {CronJob} from "cron";

export default function setupJobs (environment: Environment, jobs: (new () => Job)[]) {
    const isDevMode = environment.environment === "development";

    jobs.forEach(jobFunction => {
        const job = new jobFunction;

        const run = () => {
            if (isDevMode) { console.log(`Started job ${job.name}`); }

            job.run()
                .then(() => { if (isDevMode) { console.log(`Completed job ${job.name}`); } })
                .catch(console.log.bind(console));
        };

        new CronJob(job.schedule, run, null, true, environment.timezone);
    });
}
