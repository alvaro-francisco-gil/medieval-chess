import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export function uploadPostImage(
  postId: string, file: File, onProgress?: (percent: number) => void
): Promise<string> {
  const filename = `${crypto.randomUUID()}-${file.name}`;
  const storageRef = ref(storage, `posts/${postId}/images/${filename}`);
  const task = uploadBytesResumable(storageRef, file);
  return new Promise((resolve, reject) => {
    task.on("state_changed",
      (snapshot) => { onProgress?.((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
      (error) => reject(error),
      async () => { resolve(await getDownloadURL(task.snapshot.ref)); }
    );
  });
}

export function resizeImage(file: File, maxWidth = 1200): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width <= maxWidth) { resolve(file); return; }
      const ratio = maxWidth / img.width;
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(blob ? new File([blob], file.name, { type: file.type }) : file);
      }, file.type, 0.9);
    };
    img.src = URL.createObjectURL(file);
  });
}
