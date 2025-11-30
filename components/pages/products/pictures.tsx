import { Progress } from "@/components/ui/progress";
import { IFile } from "@/interfaces/file.interface";
import { cn } from "@/lib/utils";
import { productSchema } from "@/schemas/product";
import { Upload, X } from "lucide-react";
import { DragEvent, useCallback, useMemo, useRef, memo } from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { UppyFile, Meta } from "@uppy/core";

interface PictureProps {
  form: UseFormReturn<z.infer<typeof productSchema>>;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setFileContainerRef: (node: HTMLDivElement | null) => void;
  handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  files: UppyFile<Meta, any>[];
  calculateOverallProgress: number;
}

const RemoveButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="cursor-pointer absolute top-2 right-2 bg-white flex items-center justify-center h-[1.3rem] w-[1.3rem] rounded-full z-10"
    >
      <X className="h-3 w-3" />
    </div>
  );
};

const ImageCard = memo(
  ({
    pic,
    index,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onRemove,
    isDragging,
  }: {
    pic: IFile;
    index: number;
    onDragStart: (e: DragEvent, index: number) => void;
    onDragEnter: (e: DragEvent, index: number) => void;
    onDragEnd: () => void;
    onRemove: (url: string) => void;
    isDragging: boolean;
  }) => {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragEnter={(e) => onDragEnter(e, index)}
        onDragOver={(e) => e.preventDefault()}
        onDragEnd={onDragEnd}
        className={cn(
          "relative group cursor-move w-60 h-60 border rounded-lg overflow-hidden transition-opacity",
          isDragging && "opacity-50"
        )}
      >
        <RemoveButton onClick={() => onRemove(pic.url)} />
        <img
          alt={pic.fileName}
          src={pic.url}
          loading="lazy"
          className="w-full h-full rounded-md object-cover object-center 
              group-hover:opacity-80 transition-opacity"
          style={{ pointerEvents: "none" }}
        />
      </div>
    );
  }
);

ImageCard.displayName = "ImageCard";

const Picture = ({
  form,
  isDragging,
  fileInputRef,
  setFileContainerRef,
  handleFileInputChange,
  uploading,
  files,
  calculateOverallProgress,
}: PictureProps) => {
  const { watch, setValue } = form;
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const images = watch("images") as IFile[];

  const handleDragStart = useCallback((e: DragEvent, position: number) => {
    dragItem.current = position;
    isDraggingRef.current = true;
    e.dataTransfer.effectAllowed = "move";

    const dragImage = document.createElement("div");
    dragImage.style.width = "60px";
    dragImage.style.height = "60px";
    dragImage.style.backgroundColor = "#e5e7eb";
    dragImage.style.borderRadius = "8px";
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 30, 30);

    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, []);

  const handleDragEnter = useCallback((e: DragEvent, position: number) => {
    e.preventDefault();
    if (dragItem.current !== position) {
      dragOverItem.current = position;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;

    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      const newImages = [...images];
      const [movedItem] = newImages.splice(dragItem.current, 1);
      newImages.splice(dragOverItem.current, 0, movedItem);

      requestAnimationFrame(() => {
        setValue("images", newImages, {
          shouldValidate: false,
          shouldDirty: true,
        });
      });
    }

    dragItem.current = null;
    dragOverItem.current = null;
  }, [images, setValue]);

  const removePicture = useCallback(
    (link: string) => {
      setValue(
        "images",
        images.filter((img) => img.url !== link),
        { shouldValidate: false }
      );
    },
    [images, setValue]
  );

  const uploadProgress = useMemo(
    () => Math.min(calculateOverallProgress, 100),
    [calculateOverallProgress]
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pictures</h3>
      {form.formState.errors.images?.message && (
        <p className="text-sm text-red-600 mb-2">
          {form.formState.errors.images?.message}
        </p>
      )}
      <div className="flex items-start gap-3 flex-wrap">
        {images?.map((pic, index) => (
          <ImageCard
            key={pic.url}
            pic={pic}
            index={index}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onRemove={removePicture}
            isDragging={isDraggingRef.current && dragItem.current === index}
          />
        ))}
        <div>
          <div
            ref={setFileContainerRef}
            className={cn(
              "relative border border-dashed border-gray-300 rounded-md h-60 w-60 flex items-center justify-center cursor-pointer py-[3rem]",
              isDragging && "border-primary"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden h-full w-full"
                multiple={true}
                accept="image/*"
                onChange={handleFileInputChange}
              />
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <Upload className="w-7 h-7" />
                <span className="cursor-pointer">Click or drag and drop</span>
              </div>
            </>
          </div>
          {uploading && (
            <div className="mt-2">
              <div className="text-sm mb-1">
                Uploading {files.length} file(s)... {uploadProgress}%
              </div>
              <Progress
                value={uploadProgress}
                className="w-full [&>div]:bg-[#FFA800] bg-[#FFA800]/20"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Picture;
