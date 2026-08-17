import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/shared/icons";
import FileUpload from "@/hooks/use-file";
import { IFile } from "@/interfaces/file.interface";
import { IAccountDialogSlide } from "@/interfaces/app.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notify } from "@/lib/toast";
import {
  useGetSettingsQuery,
  useUpdateAccountDialogMutation,
} from "@/services/management.service";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const durations = [
  { value: "24", label: "24 hours" },
  { value: "72", label: "3 days" },
  { value: "168", label: "1 week" },
  { value: "336", label: "2 weeks" },
  { value: "720", label: "30 days" },
];

const createSlide = (
  overrides: Partial<IAccountDialogSlide> = {}
): IAccountDialogSlide => ({
  id: crypto.randomUUID(),
  active: true,
  title: "",
  message: "",
  imageUrl: "",
  ctaLabel: "",
  ctaUrl: "",
  displaySeconds: 5,
  durationHours: 24,
  publishedAt: null,
  expiresAt: null,
  restart: false,
  ...overrides,
});

const AccountDialog = () => {
  const { data } = useGetSettingsQuery();
  const [updateDialog, { isLoading }] = useUpdateAccountDialogMutation();
  const [enabled, setEnabled] = useState(false);
  const [slides, setSlides] = useState<IAccountDialogSlide[]>([]);

  useEffect(() => {
    const setting = data?.data;
    if (!setting) return;

    setEnabled(setting.accountDialogEnabled);
    setSlides(
      setting.accountDialogSlides?.length
        ? setting.accountDialogSlides.map((slide) =>
            createSlide({
              ...slide,
              durationHours:
                slide.durationHours ??
                setting.accountDialogDurationHours ??
                24,
              publishedAt:
                slide.publishedAt ?? setting.accountDialogPublishedAt,
              expiresAt: slide.expiresAt ?? setting.accountDialogExpiresAt,
              restart: false,
            })
          )
        : [
            createSlide({
              title: setting.accountDialogTitle ?? "",
              message: setting.accountDialogMessage ?? "",
              imageUrl: setting.accountDialogImageUrl ?? "",
              ctaLabel: setting.accountDialogCtaLabel ?? "",
              ctaUrl: setting.accountDialogCtaUrl ?? "",
              durationHours: setting.accountDialogDurationHours ?? 24,
              publishedAt: setting.accountDialogPublishedAt,
              expiresAt: setting.accountDialogExpiresAt,
            }),
          ]
    );
  }, [data]);

  const updateSlide = (
    id: string,
    patch: Partial<IAccountDialogSlide>
  ) => {
    setSlides((current) =>
      current.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide))
    );
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setSlides((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    const activeSlides = slides.filter((slide) => slide.active);
    if (enabled && activeSlides.length === 0) {
      notify("Activate at least one slide before enabling");
      return;
    }
    if (
      activeSlides.some((slide) => !slide.title.trim() || !slide.message.trim())
    ) {
      notify("Every active slide needs a title and message");
      return;
    }
    if (
      slides.some((slide) => slide.ctaLabel.trim() && !slide.ctaUrl.trim())
    ) {
      notify("Add a destination link for every action button");
      return;
    }

    try {
      const response = await updateDialog({
        enabled,
        slides: slides.map((slide) => ({
          ...slide,
          title: slide.title.trim(),
          message: slide.message.trim(),
          imageUrl: slide.imageUrl.trim(),
          ctaLabel: slide.ctaLabel.trim(),
          ctaUrl: slide.ctaUrl.trim(),
          restart: !!slide.restart,
        })),
      }).unwrap();
      notify(response.message);
    } catch {
      notify("Failed to update account dialog");
    }
  };

  return (
    <div className="mt-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-6 rounded-lg border p-4">
        <div>
          <p className="font-semibold">Show account dialog</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish active slides for users. Saving keeps each slide&apos;s
            schedule unless you restart it.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Dialog slides</h3>
            <p className="text-sm text-muted-foreground">
              Only active, non-expired slides are shown. Each slide advances
              after its own display time.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSlides((current) => [...current, createSlide()])}
          >
            <Plus className="mr-2 size-4" />
            Add slide
          </Button>
        </div>

        {slides.map((slide, index) => (
          <div key={slide.id} className="space-y-5 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="font-semibold">Slide {index + 1}</p>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={slide.active}
                    onCheckedChange={(active) =>
                      updateSlide(slide.id, { active })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {slide.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => moveSlide(index, -1)}
                  aria-label="Move slide up"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === slides.length - 1}
                  onClick={() => moveSlide(index, 1)}
                  aria-label="Move slide down"
                >
                  <ChevronDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={slides.length === 1}
                  onClick={() =>
                    setSlides((current) =>
                      current.filter((item) => item.id !== slide.id)
                    )
                  }
                  aria-label="Delete slide"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`account-dialog-title-${slide.id}`}>Title</Label>
              <Input
                id={`account-dialog-title-${slide.id}`}
                value={slide.title}
                maxLength={150}
                onChange={(event) =>
                  updateSlide(slide.id, { title: event.target.value })
                }
                placeholder="Important update"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`account-dialog-message-${slide.id}`}>
                Message
              </Label>
              <Textarea
                id={`account-dialog-message-${slide.id}`}
                value={slide.message}
                maxLength={5000}
                rows={5}
                onChange={(event) =>
                  updateSlide(slide.id, { message: event.target.value })
                }
                placeholder="Enter the message users should see"
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              {slide.imageUrl && (
                <div className="overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="max-h-72 w-full object-cover"
                  />
                </div>
              )}
              <FileUpload
                label={slide.imageUrl ? "Replace image" : "Upload image"}
                noOfFiles={1}
                fileTypes={["image/*"]}
                isMultiple={false}
                currentFiles={
                  slide.imageUrl
                    ? ([
                        {
                          url: slide.imageUrl,
                          fileName: `announcement-${index + 1}`,
                          key: slide.imageUrl,
                        },
                      ] as IFile[])
                    : []
                }
                setUploadedFiles={(files) =>
                  updateSlide(slide.id, {
                    imageUrl: files[0]?.url ?? "",
                  })
                }
              />
              {slide.imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateSlide(slide.id, { imageUrl: "" })}
                >
                  Remove image
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`account-dialog-cta-label-${slide.id}`}>
                  Action button label
                </Label>
                <Input
                  id={`account-dialog-cta-label-${slide.id}`}
                  value={slide.ctaLabel}
                  maxLength={50}
                  onChange={(event) =>
                    updateSlide(slide.id, { ctaLabel: event.target.value })
                  }
                  placeholder="Start shopping"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`account-dialog-cta-url-${slide.id}`}>
                  Action button link
                </Label>
                <Input
                  id={`account-dialog-cta-url-${slide.id}`}
                  value={slide.ctaUrl}
                  onChange={(event) =>
                    updateSlide(slide.id, { ctaUrl: event.target.value })
                  }
                  placeholder="/shop or https://..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`account-dialog-seconds-${slide.id}`}>
                  Display time (seconds)
                </Label>
                <Input
                  id={`account-dialog-seconds-${slide.id}`}
                  type="number"
                  min={2}
                  max={300}
                  value={slide.displaySeconds}
                  onChange={(event) =>
                    updateSlide(slide.id, {
                      displaySeconds: Number(event.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`account-dialog-duration-${slide.id}`}>
                  Available for
                </Label>
                <Select
                  value={String(slide.durationHours)}
                  onValueChange={(value) =>
                    updateSlide(slide.id, {
                      durationHours: Number(value),
                    })
                  }
                >
                  <SelectTrigger id={`account-dialog-duration-${slide.id}`}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id={`account-dialog-restart-${slide.id}`}
                checked={!!slide.restart}
                onCheckedChange={(checked) =>
                  updateSlide(slide.id, { restart: checked === true })
                }
              />
              <div className="space-y-1">
                <Label
                  htmlFor={`account-dialog-restart-${slide.id}`}
                  className="cursor-pointer font-medium"
                >
                  Restart availability on save
                </Label>
                <p className="text-xs text-muted-foreground">
                  Leave unchecked to keep the current expiry. Check only when
                  you want this slide&apos;s timer to start over.
                </p>
                {slide.expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    Currently expires{" "}
                    {new Date(slide.expiresAt).toLocaleString()}.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading && <Icons.spinner className="size-3 animate-spin" />}
        Publish dialog
      </Button>
    </div>
  );
};

export default AccountDialog;
