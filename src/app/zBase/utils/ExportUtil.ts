export class ExportUtil {

    static exportData(res: any, type: string) {
        const blob = new Blob([res.body], {type: type});
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        const disposition = res.headers.get('content-disposition');
        link.download = disposition?.split(';')[1].split('=')[1].replace(/"/g, '');
        link.click();
    }
}
