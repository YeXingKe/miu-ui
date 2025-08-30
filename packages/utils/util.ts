export class Util {
    // 将base64转换为文件,有ie兼容问题
    static dataURLtoFile(data: any, fileName: string) {
        const arr = data.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], fileName, { type: mime })
    }
    // 将base64转换为blob
    static dataURLtoBlob(data: any) {
        const arr = data.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], { type: mime })
    }
}