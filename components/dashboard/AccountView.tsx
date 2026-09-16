"use client";

import { useRef, useState } from "react";
import {
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineUser,
} from "react-icons/hi2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AccountView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("Justice");
  const [email, setEmail] = useState("justice@postpilot.app");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "J";

  function onPickAvatar(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

  function removeAvatar() {
    setAvatarUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function saveProfile() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function updatePassword() {
    setPasswordMsg(null);
    setPasswordError(null);
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPassword("");
    setConfirm("");
    setPasswordMsg("Password updated.");
    window.setTimeout(() => setPasswordMsg(null), 2000);
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
          Photo, name, and sign-in details for your Postpilot account.
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
                {avatarUrl ? (
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
                PNG, JPEG, WebP or GIF · Up to 5 MB
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
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="rounded-md shadow-none"
              onClick={saveProfile}
            >
              Save profile
            </Button>
            {saved ? (
              <span className="text-sm font-medium text-emerald-700">Saved</span>
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
                    showConfirm ? "Hide confirm password" : "Show confirm password"
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
              onClick={updatePassword}
            >
              Update password
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
            disabled
          >
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
