export const fileTypeImgList = {
  "audio": "/images/file/audio.svg",
  "cad": "/images/file/cad.svg",
  "collect": "/images/file/collect.svg",
  "excel": "/images/file/excel.svg",
  "exe": "/images/file/exe.svg",
  "dir": "/images/file/folder.svg",
  "html": "/images/file/html.svg",
  "png": "/images/file/image.svg",
  "jpg": "/images/file/image.svg",
  "jpeg": "/images/file/image.svg",
  "gif": "/images/file/image.svg",
  "bmp": "/images/file/image.svg",
  "iso": "/images/file/iso.svg",
  "other": "/images/file/other.svg",
  "pdf": "/images/file/pdf.svg",
  "ppt": "/images/file/ppt.svg",
  "psd": "/images/file/psd.svg",
  "recycle": "/images/file/recycle.svg",
  "txt": "/images/file/txt.svg",
  "mp4": "/images/file/video.svg",
  "doc": "/images/file/word.svg",
  "zip": "/images/file/zip.svg",
  "rar": "/images/file/zip.svg",
  "7z": "/images/file/zip.svg"
}


/**
 *
 * @param a 文件大小，字节
 * @param b
 * @returns {string}
 */
export function formatFileSize(a:number, b:number) {
    if (0 === a) return "0 Bytes";
    const c = 1024,
        d = b || 2,
        e = ["Bytes",
            "KB",
            "MB",
            "GB",
            "TB",
            "PB",
            "EB",
            "ZB",
            "YB"],
        f = Math.floor(Math.log(a) / Math.log(c));
    return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
}

/**
 * 根据文件名称（后缀）获取图片
 * @param fileName
 * @returns {string}
 */
export function getTypeImgByFileName(fileName:string) {
    let type = fileTypeImgList.other
    if (fileName) {
        let index1 = fileName.lastIndexOf(".")
        if (index1 !== -1) {
            let suffix = fileName.substring(index1 + 1, fileName.length)
            type = (fileTypeImgList as any)[suffix] || type
        }
    }
    return type
}

export function isImg(f:string) {
    return /\.(gif|jpg|jpeg|png|GIF|JPG|PNG|ico|ICO)$/.test(f);
}

export function isVideo(f:string) {
    return /\.(mp4|avi|mkv|wmv|webm|MP4|AVI|MKV|WMV|WEBM)$/.test(f);
}
