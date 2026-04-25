import moment from "moment";

export class DateUtil {


    public static formatDate(date: Date): Date {
        if (date != null) {
            date = new Date(date);
            const formattedDate = moment(date).format("MM/DD/YYYY HH:mm");
            date = new Date(formattedDate);
        }
        return date;
    }
}
