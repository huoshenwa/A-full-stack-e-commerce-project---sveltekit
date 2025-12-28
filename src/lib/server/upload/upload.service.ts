// // src/lib/server/upload/upload.service.ts
// 图片上传系统
// import { writeFile, mkdir } from 'fs/promises';
// import { join } from 'path';
// import { randomUUID } from 'crypto';

// export class UploadError extends Error {
//     constructor(message: string, public code: string, public statusCode: number = 400) {
//         super(message);
//         this.name = 'UploadError';
//     }

//     static InvalidFileType = new UploadError('Invalid file type', 'INVALID_FILE_TYPE', 400);
//     static FileTooLarge = new UploadError('File too large', 'FILE_TOO_LARGE', 400);
// }

// export class UploadService {
//     private readonly uploadDir = 'static/uploads';
//     private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
//     private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

//     /**
//      * 上传单个文件（本地存储）
//      */
//     async uploadFile(file: File): Promise<string> {
//         // 验证文件类型
//         if (!this.allowedTypes.includes(file.type)) {
//             throw UploadError.InvalidFileType;
//         }

//         // 验证文件大小
//         if (file.size > this.maxFileSize) {
//             throw UploadError.FileTooLarge;
//         }

//         // 生成文件名
//         const ext = file.name.split('.').pop();
//         const filename = `${randomUUID()}.${ext}`;
//         const date = new Date();
//         const dateFolder = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;

//         // 确保目录存在
//         const uploadPath = join(this.uploadDir, dateFolder);
//         await mkdir(uploadPath, { recursive: true });

//         // 保存文件
//         const filepath = join(uploadPath, filename);
//         const buffer = await file.arrayBuffer();
//         await writeFile(filepath, Buffer.from(buffer));

//         // 返回访问 URL
//         return `/uploads/${dateFolder}/${filename}`;
//     }

//     /**
//      * 上传多个文件
//      */
//     async uploadFiles(files: File[]): Promise<string[]> {
//         const urls: string[] = [];

//         for (const file of files) {
//             const url = await this.uploadFile(file);
//             urls.push(url);
//         }

//         return urls;
//     }

//     /**
//      * 压缩图片（可选，需要 sharp 库）
//      */
//     // async compressImage(buffer: Buffer): Promise<Buffer> {
//     //   const sharp = await import('sharp');
//     //   return sharp.default(buffer)
//     //     .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
//     //     .jpeg({ quality: 80 })
//     //     .toBuffer();
//     // }
// }

// export const uploadService = new UploadService();

// // src/routes/api/upload/+server.ts
// import { json } from '@sveltejs/kit';
// import { uploadService, UploadError } from '$lib/server/upload/upload.service';
// import { requireAuth } from '$lib/server/auth/auth.guard';
// import type { RequestHandler } from './$types';

// export const POST: RequestHandler = async ({ request, locals }) => {
//     try {
//         requireAuth(locals.user);

//         const formData = await request.formData();
//         const files = formData.getAll('files') as File[];

//         if (files.length === 0) {
//             return json({ error: 'No files provided' }, { status: 400 });
//         }

//         const urls = await uploadService.uploadFiles(files);

//         return json({ urls });
//     } catch (err: any) {
//         if (err instanceof UploadError) {
//             return json({ error: err.message }, { status: err.statusCode });
//         }
//         return json({ error: 'Upload failed' }, { status: 500 });
//     }
// };