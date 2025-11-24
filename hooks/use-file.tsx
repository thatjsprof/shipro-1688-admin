import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Trash, Plus, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { IFile } from "@/interfaces/file.interface";
import { useState } from "react";
import { useFileUpload } from "./use-upload";

interface IFileUpload {
  fileTypes?: string[];
  noOfFiles?: number | null;
  maxFileSize?: number;
  setUploadedFiles: (files: IFile[]) => void;
  currentFiles?: IFile[];
  isMultiple?: boolean;
  error?: boolean;
}

const FileUpload = ({
  fileTypes = ["image/*"],
  noOfFiles,
  maxFileSize,
  currentFiles = [],
  isMultiple,
  setUploadedFiles,
  error,
}: IFileUpload) => {
  const [open, setOpen] = useState(false);

  const {
    uppy,
    files,
    isDragging,
    showUploader,
    uploading,
    calculateOverallProgress,
    fileInputRef,
    setFileContainerRef,
    setShowUploader,
    handleFileInputChange,
    handleUploadFiles,
    getFileIcon,
  } = useFileUpload({
    fileTypes,
    noOfFiles,
    maxFileSize,
    setUploadedFiles,
    isReady: open,
    currentFiles,
    isMultiple,
  });

  const onUploadClick = () => {
    handleUploadFiles();
    setOpen(false);
  };

  return (
    <div>
      <div className="space-y-2">
        <Button
          type="button"
          className={cn(
            "relative w-full justify-between shadow-none data-[state=open]:border-primary data-[state=open]:outline-offset-0 h-11 rounded-md hover:border-zinc-400 border bg-white px-3 py-1 overflow-hidden hover:bg-transparent bg-transparent",
            error && "border-destructive"
          )}
          onClick={() => setOpen(true)}
        >
          <span className="text-gray-400 font-normal">
            {uploading
              ? `Uploading ${files.length} file(s)... ${Math.min(
                  calculateOverallProgress,
                  100
                )}%`
              : files.length > 0
              ? `${files.length} files selected`
              : "Click here to upload your pictures"}
          </span>
        </Button>
        {uploading && (
          <Progress
            value={Math.min(calculateOverallProgress, 100)}
            className="w-full [&>div]:bg-[#FFA800] bg-[#FFA800]/20"
          />
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 h-[75vh] flex flex-col gap-0 border border-gray-200">
          <DialogHeader className="px-5 pt-5 flex-shrink-0">
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {!showUploader && (
            <div className="p-5 pb-6 pt-3 border-b border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 shadow-none !bg-gray-500 hover:!bg-gray-500/90 !border-gray-500 !text-white"
                onClick={() => setShowUploader(true)}
              >
                <Plus className="w-4 h-4" /> Add More Files
              </Button>
            </div>
          )}
          <div className="flex-1">
            {showUploader ? (
              <div className="p-5 pt-3 h-full">
                <div
                  ref={setFileContainerRef}
                  className={cn(
                    "relative border border-dashed border-gray-300 rounded-md h-full flex items-center justify-center cursor-pointer",
                    isDragging && "border-primary"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden h-full w-full"
                    multiple={true}
                    accept={fileTypes?.join(",")}
                    onChange={handleFileInputChange}
                  />
                  {files.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUploader(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <Upload className="w-7 h-7" />
                    <span className="cursor-pointer">
                      Click here or drag and drop to upload files
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="space-y-2 max-h-[calc(75vh-195px)] overflow-y-auto px-5 pt-5 pb-5">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 px-3 border border-gray-200 rounded-md"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {getFileIcon(file)}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {file.size
                                ? (file.size / 1024 / 1024).toFixed(2)
                                : 0}{" "}
                              MB
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => uppy.removeFile(file.id)}
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {!showUploader && files.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 p-5 rounded-b-md">
              <Button className="w-full h-10" onClick={onUploadClick}>
                Upload Files
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUpload;
