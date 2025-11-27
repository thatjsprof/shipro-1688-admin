import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Uppy, { Meta, UploadResult, UppyFile } from "@uppy/core";
import DropTarget from "@uppy/drop-target";
import AwsS3 from "@uppy/aws-s3";
import { notify } from "@/lib/toast";
import { IFile } from "@/interfaces/file.interface";
import { cn } from "@/lib/utils";

interface UseFileUploadProps {
  fileTypes?: string[];
  noOfFiles?: number | null;
  maxFileSize?: number;
  setUploadedFiles: (files: IFile[]) => void;
  currentFiles?: IFile[];
  isMultiple?: boolean;
  isReady?: boolean;
  onFilesAdded?: (files: UppyFile<Meta, any>[]) => void;
  preventUpload?: boolean;
}

interface UseFileUploadReturn {
  uppy: Uppy;
  files: UppyFile<Meta, any>[];
  isDragging: boolean;
  showUploader: boolean;
  uploading: boolean;
  uploaded: boolean;
  calculateOverallProgress: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileContainerRef: React.RefObject<HTMLDivElement | null>;
  setFileContainerRef: (node: HTMLDivElement | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setShowUploader: (show: boolean) => void;
  handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadFiles: () => Promise<
    UploadResult<Meta, Record<string, never>> | undefined
  >;
  setFiles: React.Dispatch<React.SetStateAction<UppyFile<Meta, any>[]>>;
  getFileIcon: (
    file: UppyFile<Meta, any>,
    props?: { className?: string }
  ) => React.JSX.Element;
}

function createUppy(
  fileTypes = ["image/*"],
  noOfFiles?: number | null,
  maxFileSize = 100 * 1024 * 1024
) {
  return new Uppy({
    debug: true,
    autoProceed: false,
    restrictions: {
      maxFileSize,
      allowedFileTypes: fileTypes,
      maxNumberOfFiles: noOfFiles,
    },
  });
}

export const useFileUpload = ({
  fileTypes = ["image/*"],
  noOfFiles,
  maxFileSize = 100 * 1024 * 1024,
  setUploadedFiles,
  currentFiles = [],
  isMultiple,
  isReady = true,
  onFilesAdded,
  preventUpload = false,
}: UseFileUploadProps): UseFileUploadReturn => {
  const [uppy] = useState(() => createUppy(fileTypes, noOfFiles, maxFileSize));
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UppyFile<Meta, any>[]>([]);
  const [showUploader, setShowUploader] = useState(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [version, setVersion] = useState(0);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const [isContainerReady, setIsContainerReady] = useState(false);
  const uploadedFilesCount = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileContainerRef = useRef<HTMLDivElement>(null);
  const currentFilesRef = useRef(currentFiles);
  const isMultipleRef = useRef(isMultiple);
  const uploadedInternalRef = useRef<IFile[]>([]);
  const processedUploads = useRef<Set<string>>(new Set());
  const onFilesAddedRef = useRef(onFilesAdded);

  useEffect(() => {
    onFilesAddedRef.current = onFilesAdded;
  }, [onFilesAdded]);

  const setFileContainerRef = useCallback((node: HTMLDivElement | null) => {
    fileContainerRef.current = node;
    setIsContainerReady(!!node);
  }, []);

  const handleUploadFiles = useCallback(async () => {
    if (preventUpload) {
      console.warn("Upload prevented by preventUpload prop");
      return;
    }
    return await uppy.upload();
  }, [uppy, preventUpload]);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const target = event.target;
      const files = target?.files ? Array.from(target.files) : [];

      files.forEach((file) => {
        try {
          const existingFile = uppy
            .getFiles()
            .find((f) => f.name === file.name && f.size === file.size);

          if (!existingFile) {
            uppy.addFile({
              source: "file input",
              name: file.name,
              type: file.type,
              data: file,
            });
          }
        } catch (err: any) {
          if (err.isRestriction) {
            console.log("Restriction error:", err);
            notify(err.message || "File upload restriction error", "error");
          } else {
            console.error(err);
          }
        }
      });
    },
    [uppy]
  );

  const getFileIcon = useCallback(
    (file: UppyFile<Meta, any>, props?: { className?: string }) => {
      if (file.type?.startsWith("image/")) {
        return (
          <div
            className={cn(
              "w-10 h-10 rounded-md overflow-hidden bg-gray-100",
              props?.className
            )}
          >
            <img
              src={URL.createObjectURL(file.data as Blob)}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        );
      }

      if (file.type?.includes("pdf") || file.type?.includes("document")) {
        const { FileText } = require("lucide-react");
        return (
          <FileText
            className={cn("w-10 h-10 text-blue-500", props?.className)}
          />
        );
      }

      const { File } = require("lucide-react");
      return (
        <File className={cn("w-10 h-10 text-gray-500", props?.className)} />
      );
    },
    []
  );

  const calculateOverallProgress = useMemo(() => {
    const files = uppy.getFiles();
    if (!files.length) return 0;

    const total = files.reduce((sum, file) => {
      return sum + (file.progress?.percentage ?? 0);
    }, 0);

    return Math.floor(total / files.length);
  }, [version, uppy]);

  useEffect(() => {
    if (uploading) setVersion(0);
  }, [uploading]);

  useEffect(() => {
    if (!uppy) return;

    const s3Plugin = uppy.getPlugin("AWS-S3");
    if (!s3Plugin) {
      uppy.use(AwsS3, {
        id: "AWS-S3",
        endpoint: `${process.env.SERVER_URL!}/companion`,
      });
    }

    const handleUpload = () => setUploading(true);
    const handleFileAdded = async () => {
      const currentFiles = uppy.getFiles();
      setFiles(currentFiles);
      setShowUploader(false);

      if (onFilesAddedRef.current) {
        onFilesAddedRef.current(currentFiles);
      }
    };
    const handleFileRemoved = () => {
      const currentFiles = uppy.getFiles();
      setFiles(currentFiles);
      if (currentFiles.length === 0) {
        setShowUploader(true);
      }
    };
    const handleUploadSuccess = async (
      file: UppyFile<Meta, Record<string, never>> | undefined,
      response: {
        body?: Record<string, never> | undefined;
        status: number;
        bytesUploaded?: number;
        uploadURL?: string;
      }
    ) => {
      if (!file) return;

      if (processedUploads.current.has(file.id)) return;
      processedUploads.current.add(file.id);

      const currentFiles = currentFilesRef.current;
      const isMultiple = isMultipleRef.current;

      if (!response.uploadURL) return;

      const fileUploaded = {
        fileName: file.name || "",
        url: file.uploadURL || response.uploadURL || "",
        fileSize: file.size || 0,
        key:
          (
            file as unknown as {
              s3Multipart: {
                key: string;
              };
            }
          )?.s3Multipart?.key || (response.body?.Key as unknown as string),
        type: file.type,
        extension: file.extension,
        uploadId: file.id,
      };

      const toReturn = [...uploadedInternalRef.current];
      const alreadyUploaded = toReturn.find(
        (f) => f.uploadId === fileUploaded.uploadId
      );

      if (!alreadyUploaded) {
        toReturn.push(fileUploaded);
        uploadedInternalRef.current = toReturn;
      }

      if (uploadedInternalRef.current.length === uppy.getFiles().length) {
        setUploaded(true);
        setUploading(false);

        const uploadedFiles = uploadedInternalRef.current;
        const files: IFile[] = uploadedFiles.map((file) => ({
          ...file,
        }));

        setTimeout(async () => {
          setUploadedFiles(isMultiple ? [...currentFiles, ...files] : files);
          uppy.cancelAll();
          uploadedInternalRef.current = [];
          processedUploads.current.clear();
        }, 200);
      }
    };
    const handleUploadError = (
      file: UppyFile<Meta, Record<string, never>> | undefined,
      error: {
        name: string;
        message: string;
        details?: string;
      },
      response:
        | Omit<
            {
              body?: Record<string, never> | undefined;
              status: number;
              bytesUploaded?: number;
              uploadURL?: string;
            },
            "uploadURL"
          >
        | undefined
    ) => {
      if (file) {
        uploadedFilesCount.current++;
        if (uploadedFilesCount.current === uppy.getFiles().length) {
          setUploading(false);
        }
        console.error(`❌ Upload failed for ${file.name}:`, error);
        console.error("Server Response:", response);
        notify(`Upload failed for ${file.name}: ${error.message}`, "error");
      }
    };

    const handleComplete = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    uppy.on("upload", handleUpload);
    uppy.on("file-added", handleFileAdded);
    uppy.on("file-removed", handleFileRemoved);
    uppy.on("upload-success", handleUploadSuccess);
    uppy.on("upload-error", handleUploadError);
    uppy.on("complete", handleComplete);

    return () => {
      uppy.off("upload", handleUpload);
      uppy.off("file-added", handleFileAdded);
      uppy.off("file-removed", handleFileRemoved);
      uppy.off("upload-success", handleUploadSuccess);
      uppy.off("upload-error", handleUploadError);
      uppy.off("complete", handleComplete);
    };
  }, [uppy, setUploadedFiles]);

  useEffect(() => {
    const triggerUpdate = () => setVersion((v) => v + 1);

    uppy.on("upload-progress", triggerUpdate);
    uppy.on("upload-success", triggerUpdate);
    uppy.on("upload-error", triggerUpdate);

    return () => {
      uppy.off("upload-progress", triggerUpdate);
      uppy.off("upload-success", triggerUpdate);
      uppy.off("upload-error", triggerUpdate);
    };
  }, [uppy]);

  useEffect(() => {
    currentFilesRef.current = currentFiles;
    isMultipleRef.current = isMultiple;
  }, [currentFiles, isMultiple]);

  useEffect(() => {
    if (!uppy || !showUploader || !isReady || !isContainerReady) return;

    const timeoutId = setTimeout(() => {
      if (!fileContainerRef.current) return;

      const existingPlugin = uppy.getPlugin("drop-target");
      if (existingPlugin) {
        uppy.removePlugin(existingPlugin);
      }

      uppy.use(DropTarget, {
        id: "drop-target",
        target: fileContainerRef.current,
        onDragOver: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        onDrop: () => setIsDragging(false),
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      const plugin = uppy.getPlugin("drop-target");
      if (plugin) {
        uppy.removePlugin(plugin);
      }
    };
  }, [uppy, showUploader, isReady, isContainerReady]);

  return {
    uppy,
    files,
    setFiles,
    isDragging,
    showUploader,
    uploading,
    uploaded,
    calculateOverallProgress,
    fileInputRef,
    fileContainerRef,
    setFileContainerRef,
    setIsDragging,
    setShowUploader,
    handleFileInputChange,
    handleUploadFiles,
    getFileIcon,
  };
};
