import { constructFromFileList, getFileId } from "../models/FileTree";
import { Metadata } from "../models/Metadata";
import { uploadFileContent } from "../utils/file";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface UploadResponse {
  result: {
    cid: string;
    transactionResults: Array<{
      blockHash: string;
      batchTxHash: string;
      index: number;
    }>;
  };
}

export const ApiService = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const response = await fetch(`${API_BASE_URL}/upload-file`, {
      method: "POST",
      body: JSON.stringify({
        data: await uploadFileContent(file),
        filename: file.name,
        mimeType: file.type,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.json();
  },
  uploadFolder: async (files: FileList): Promise<UploadResponse> => {
    const formData = new FormData();

    const folderTree = constructFromFileList(files);
    formData.append("folderTree", JSON.stringify(folderTree));

    Array.from(files).forEach((file) => {
      formData.append(getFileId(file), file);
    });

    const response = await fetch(`${API_BASE_URL}/upload-folder`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.json();
  },
  fetchMetadata: async (cid: string): Promise<Metadata> => {
    const response = await fetch(`${API_BASE_URL}/metadata/${cid}`);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    return response.json();
  },
};
