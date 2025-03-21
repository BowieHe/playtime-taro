export function getContentTypeFromFilePath(filePath: string): string {
    // Default content type for images
    let contentType = 'image/jpeg';

    // Get file extension (convert to lowercase)
    const ext = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();

    // Map extensions to content types
    switch (ext) {
        case 'png':
            contentType = 'image/png';
            break;
        case 'jpg':
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        case 'webp':
            contentType = 'image/webp';
            break;
        case 'bmp':
            contentType = 'image/bmp';
            break;
        case 'heic':
            contentType = 'image/heic';
            break;
        case 'svg':
            contentType = 'image/svg+xml';
            break;
        default:
            console.warn(`Unknown file extension: ${ext}, using default content type`);
    }

    return contentType;
}

export interface FileUploadResponse {
    filename: string;
    url: string;
}
