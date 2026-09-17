"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineUser,
} from "react-icons/hi2";
import {
  changePasswordAction,
  deleteAccountAction,
  saveProfileAction,
} from "@/app/dashboard/account/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_TIMEZONE, type UserProfile } from "@/lib/types/profile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIMEZONES = [
  { value: "", label: "Detect from browser" },
  { value: "US/Eastern", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Africa/Lagos", label: "West Africa (WAT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "UTC", label: "UTC" },
] as const;

function normalizeTimezone(value: string | null | undefined): string {
  const tz = value?.trim() || "";
  if (!tz || tz === DEFAULT_TIMEZONE) return "";
  return tz;
}

function resolveBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export default function AccountView({
  initialProfile,
}: {
  initialProfile: UserProfile;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const [name, setName] = useState(initialProfile.name || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [bio, setBio] = useState(initialProfile.bio || "");
  const [timezone, setTimezone] = useState(
    normalizeTimezone(initialProfile.timezone),
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialProfile.avatar || null,
  );
  const [avatarCleared, setAvatarCleared] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U";

  function onPickAvatar(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }
    pendingFileRef.current = file;
    setAvatarCleared(false);
    const url = URL.createObjectURL(file);
    setAvatarUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  }

  function removeAvatar() {
    pendingFileRef.current = null;
    setAvatarCleared(true);
    setAvatarUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  async function uploadPendingAvatar(): Promise<string | null> {
    const file = pendingFileRef.current;
    if (!file) return null;

    const formData = new FormData();
    formData.append("files", file);

    const response = await fetch("/api/upload-post-images", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as
      | { success: true; data: string[] }
      | { success: false; error: string };

    if (!result.success) {
      throw new Error(result.error || "Failed to upload photo.");
    }

    const url = result.data[0];
    if (!url) {
      throw new Error("Upload succeeded but no URL was returned.");
    }

    pendingFileRef.current = null;
    return url;
  }

  async function saveProfile() {
    setSaving(true);
    setProfileError(null);

    try {
      let nextAvatarUrl: string | null | undefined;
      if (pendingFileRef.current) {
        nextAvatarUrl = await uploadPendingAvatar();
      } else if (avatarCleared) {
        nextAvatarUrl = null;
      } else if (avatarUrl?.startsWith("http")) {
        nextAvatarUrl = avatarUrl;
      }

      const result = await saveProfileAction({
        name,
        email,
        bio,
        timezone: timezone.trim() || resolveBrowserTimeZone(),
        avatarUrl: nextAvatarUrl,
      });

      if (!result.success) {
        setProfileError(result.error);
        toast.error("Couldn’t save profile", { description: result.error });
        return;
      }

      setName(result.data.name);
      setEmail(result.data.email);
      setBio(result.data.bio || "");
      setTimezone(normalizeTimezone(result.data.timezone));
      setAvatarUrl(result.data.avatar || null);
      setAvatarCleared(false);
      setSaved(true);
      toast.success("Profile saved");
      router.refresh();
      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setProfileError(message);
      toast.error("Couldn’t save profile", { description: message });
    } finally {
      setSaving(false);
    }
  }

  async function updatePassword() {
    setPasswordMsg(null);
    setPasswordError(null);
    if (!currentPassword) {
      setPasswordError("Enter your current password to set a new one.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setUpdatingPassword(true);
    const result = await changePasswordAction({
      currentPassword,
      newPassword: password,
    });
    setUpdatingPassword(false);
    if (!result.success) {
      setPasswordError(result.error);
      toast.error("Couldn’t update password", { description: result.error });
      return;
    }
    setCurrentPassword("");
    setPassword("");
    setConfirm("");
    setPasswordMsg("Password updated.");
    toast.success("Password updated");
    window.setTimeout(() => setPasswordMsg(null), 2000);
  }

  function openDeleteDialog() {
    setDeletePassword("");
    setDeleteConfirm("");
    setDeleteError(null);
    setShowDeletePassword(false);
    setDeleteOpen(true);
  }

  async function confirmDeleteAccount() {
    setDeleteError(null);
    if (!deletePassword.trim()) {
      setDeleteError("Enter your current password to continue.");
      return;
    }
    if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Type DELETE to confirm.');
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteAccountAction({
        currentPassword: deletePassword,
        confirmation: deleteConfirm,
      });
      if (result && !result.success) {
        setDeleteError(result.error);
        toast.error("Couldn’t delete account", { description: result.error });
      }
    } catch {
      // redirect() from the server action throws; navigation handles the rest
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 md:gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Account
        </p>
        <h1 className="mt-1 font-[family-name:var(--pp-display)] text-3xl font-medium tracking-tight sm:text-[2.5rem] sm:leading-none">
          Your profile
        </h1>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Photo, name, timezone, and sign-in details for your Postpilot account.
        </p>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Profile photo
          </CardTitle>
          <CardDescription>
            Shown in the sidebar and across your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <Avatar className="size-24 rounded-2xl sm:size-28">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={name}
                  className="rounded-2xl object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-2xl bg-muted text-3xl font-semibold text-muted-foreground sm:text-4xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md shadow-none"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload photo
                </Button>
                {avatarUrl || avatarCleared ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-md text-muted-foreground shadow-none"
                    onClick={removeAvatar}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, WebP or GIF · Up to 5 MB · Saved with profile
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onPickAvatar(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Profile details
          </CardTitle>
          <CardDescription>
            How your name appears inside Postpilot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-name">Display name</Label>
              <div className="relative">
                <HiOutlineUser className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 shadow-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-email">Email</Label>
              <div className="relative">
                <HiOutlineEnvelope className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 shadow-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-bio">Bio</Label>
            <Textarea
              id="account-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about you"
              className="min-h-[96px] shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-timezone">Timezone</Label>
            <select
              id="account-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value || "auto"} value={tz.value}>
                  {tz.label}
                </option>
              ))}
              {timezone &&
              !TIMEZONES.some((tz) => tz.value === timezone) ? (
                <option value={timezone}>{timezone}</option>
              ) : null}
            </select>
            <p className="text-xs text-muted-foreground">
              Used for scheduling and “today” across the dashboard. Detect saves
              your current browser timezone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="rounded-md shadow-none"
              disabled={saving}
              onClick={() => void saveProfile()}
            >
              {saving ? "Saving…" : "Save profile"}
            </Button>
            {saved ? (
              <span className="text-sm font-medium text-emerald-700">Saved</span>
            ) : null}
            {profileError ? (
              <span className="text-sm font-medium text-destructive">
                {profileError}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium">
            Password
          </CardTitle>
          <CardDescription>
            Update the password you use to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-current-password">Current password</Label>
            <div className="relative">
              <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="account-current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="pl-9 pr-10 shadow-none"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? (
                  <HiOutlineEyeSlash className="size-4" />
                ) : (
                  <HiOutlineEye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-password">New password</Label>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 shadow-none"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="size-4" />
                  ) : (
                    <HiOutlineEye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-confirm">Confirm password</Label>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="account-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9 pr-10 shadow-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirm ? (
                    <HiOutlineEyeSlash className="size-4" />
                  ) : (
                    <HiOutlineEye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          {passwordError ? (
            <p className="text-sm font-medium text-red-600">{passwordError}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-md shadow-none"
              disabled={updatingPassword}
              onClick={() => void updatePassword()}
            >
              {updatingPassword ? "Updating…" : "Update password"}
            </Button>
            {passwordMsg ? (
              <span className="text-sm font-medium text-emerald-700">
                {passwordMsg}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className={cn("border-border shadow-none")}>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--pp-display)] text-xl font-medium text-red-600">
            Danger zone
          </CardTitle>
          <CardDescription>
            Permanently delete your Postpilot account and queue data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-red-200 text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
            onClick={openDeleteDialog}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteOpen(false);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your profile, scheduled posts, settings,
              and connected X account. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Current password</Label>
              <div className="relative">
                <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="delete-password"
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-9 pr-10 shadow-none"
                  disabled={deleting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowDeletePassword((v) => !v)}
                  aria-label={
                    showDeletePassword ? "Hide password" : "Show password"
                  }
                >
                  {showDeletePassword ? (
                    <HiOutlineEyeSlash className="size-4" />
                  ) : (
                    <HiOutlineEye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <span className="font-semibold text-foreground">DELETE</span>{" "}
                to confirm
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="shadow-none"
                disabled={deleting}
                autoComplete="off"
              />
            </div>

            {deleteError ? (
              <p className="text-sm font-medium text-red-600">{deleteError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-600 shadow-none hover:bg-red-50 hover:text-red-700"
              disabled={deleting}
              onClick={() => void confirmDeleteAccount()}
            >
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
