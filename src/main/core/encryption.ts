
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import Environment from "../context/environment";
import {getInjection} from "../injection/injector";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

export function encrypt (item: object) {
    const environment: Environment = getInjection(Environment);

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(environment.encryptionKey), iv);
    let encrypted = cipher.update(Buffer.from(JSON.stringify(item)));
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('base64') + ':' + encrypted.toString('base64');
}

export function decrypt (item: string): object {
    const environment: Environment = getInjection(Environment);

    const items = item.split(':');
    const iv = new Buffer(items.shift(), 'base64');
    const encryptedText = new Buffer(items.join(':'), 'base64');
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(environment.encryptionKey), iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
}
