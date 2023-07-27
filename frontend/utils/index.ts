import Rusha from 'rusha';

function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target?.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

export async function getImageHash(file: File): Promise<string> {
    try {
        const buffer = await readAsArrayBuffer(file);
        return Rusha.createHash().update(buffer as any).digest('hex')
    } catch (err) {
        console.error(`Failed to read the file or generate its hash: ${err}`);
        throw err;
    }
}

export function isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/jpeg', 'image/png'];
    return file && acceptedImageTypes.includes(file.type);
}

export function isFileSizeValid(file: File): boolean {
    const maxSizeMB = 4; // Maximum size in MB
    const maxSizeBytes = maxSizeMB * 1e6;
    return file && file.size <= maxSizeBytes;
}


export function getFileExtension(file: File): string {
    const fileName = file.name;
    return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
}
