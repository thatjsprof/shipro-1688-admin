import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/shared/icons";
import FileUpload from "@/hooks/use-file";
import { IFile } from "@/interfaces/file.interface";
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
import { useEffect, useState } from "react";

const durations = [
  { value: "24", label: "24 hours" },
  { value: "72", label: "3 days" },
  { value: "168", label: "1 week" },
  { value: "336", label: "2 weeks" },
  { value: "720", label: "30 days" },
];

const AccountDialog = () => {
  const { data } = useGetSettingsQuery();
  const [updateDialog, { isLoading }] = useUpdateAccountDialogMutation();
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [durationHours, setDurationHours] = useState("24");

  useEffect(() => {
    const setting = data?.data;
    if (!setting) return;

    setEnabled(setting.accountDialogEnabled);
    setTitle(setting.accountDialogTitle ?? "");
    setMessage(setting.accountDialogMessage ?? "");
    setImageUrl(setting.accountDialogImageUrl ?? "");
    setCtaLabel(setting.accountDialogCtaLabel ?? "");
    setCtaUrl(setting.accountDialogCtaUrl ?? "");
    setDurationHours(String(setting.accountDialogDurationHours ?? 24));
  }, [data]);

  const handleSave = async () => {
    if (enabled && (!title.trim() || !message.trim())) {
      notify("Add a title and message before enabling");
      return;
    }
    if (ctaLabel.trim() && !ctaUrl.trim()) {
      notify("Add a destination link for the action button");
      return;
    }

    try {
      const response = await updateDialog({
        enabled,
        title: title.trim(),
        message: message.trim(),
        imageUrl,
        ctaLabel: ctaLabel.trim(),
        ctaUrl: ctaUrl.trim(),
        durationHours: Number(durationHours),
      }).unwrap();
      notify(response.message);
    } catch {
      notify("Failed to update account dialog");
    }
  };

  return (
    <div className="mt-6 max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-6 rounded-lg border p-4">
        <div>
          <p className="font-semibold">Show account dialog</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish this announcement immediately for the selected duration.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-dialog-title">Title</Label>
        <Input
          id="account-dialog-title"
          value={title}
          maxLength={150}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Important update"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-dialog-message">Message</Label>
        <Textarea
          id="account-dialog-message"
          value={message}
          maxLength={5000}
          rows={7}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Enter the message users should see"
        />
      </div>

      <div className="space-y-2">
        <Label>Announcement image</Label>
        {imageUrl && (
          <div className="overflow-hidden rounded-lg border bg-muted">
            <img
              src={imageUrl}
              alt="Announcement preview"
              className="max-h-72 w-full object-cover"
            />
          </div>
        )}
        <FileUpload
          label={imageUrl ? "Replace image" : "Upload announcement image"}
          noOfFiles={1}
          fileTypes={["image/*"]}
          isMultiple={false}
          currentFiles={
            imageUrl
              ? ([
                  {
                    url: imageUrl,
                    fileName: "announcement",
                    key: imageUrl,
                  },
                ] as IFile[])
              : []
          }
          setUploadedFiles={(files) => setImageUrl(files[0]?.url ?? "")}
        />
        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImageUrl("")}
          >
            Remove image
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="account-dialog-cta-label">
            Action button label
          </Label>
          <Input
            id="account-dialog-cta-label"
            value={ctaLabel}
            maxLength={50}
            onChange={(event) => setCtaLabel(event.target.value)}
            placeholder="Start shopping"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-dialog-cta-url">Action button link</Label>
          <Input
            id="account-dialog-cta-url"
            value={ctaUrl}
            onChange={(event) => setCtaUrl(event.target.value)}
            placeholder="/shop or https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-dialog-duration">Available for</Label>
        <Select value={durationHours} onValueChange={setDurationHours}>
          <SelectTrigger id="account-dialog-duration">
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
        <p className="text-xs text-muted-foreground">
          The announcement starts when saved and automatically disappears for
          everyone when this period ends.
        </p>
      </div>

      {data?.data.accountDialogExpiresAt && enabled && (
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Current announcement expires{" "}
          {new Date(data.data.accountDialogExpiresAt).toLocaleString()}.
          Saving again restarts the selected duration.
        </div>
      )}

      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="font-semibold">{title || "Announcement title"}</p>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className="mt-3 max-h-52 w-full rounded-md object-cover"
            />
          )}
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {message || "Your announcement message will appear here."}
          </p>
          {ctaLabel && (
            <Button type="button" className="mt-4" tabIndex={-1}>
              {ctaLabel}
            </Button>
          )}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading && <Icons.spinner className="size-3 animate-spin" />}
        Publish dialog
      </Button>
    </div>
  );
};

export default AccountDialog;
