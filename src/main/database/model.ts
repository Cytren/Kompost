
import {
    BaseEntity, Entity, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, Column
} from "typeorm";

import * as moment from "moment";

const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

@Entity()
export default abstract class Model extends BaseEntity {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Column()
    createdAt: string;

    @Column()
    updatedAt: string;

    @BeforeInsert()
    private onCreate () {
        this.createdAt = moment().format(DATE_TIME_FORMAT);
        this.updatedAt = moment().format(DATE_TIME_FORMAT);
    }

    @BeforeUpdate()
    private onUpdate () {
        this.updatedAt = moment().format(DATE_TIME_FORMAT);
    }
}
