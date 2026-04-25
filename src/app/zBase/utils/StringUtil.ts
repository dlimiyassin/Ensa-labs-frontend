export class StringUtil {

    public static isEmpty(value: any): boolean {
        if (value instanceof Array) {
            return value.length === 0;
        } else {
            return value === null || value === undefined || value.toString() === '';
        }
    }


}
