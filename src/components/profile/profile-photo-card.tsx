"use client";

import { useRef } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api-error";
import { getInitials } from "@/lib/initials";
import { useUpdateMyImageMutation } from "@/store/api/auth/api/authApi";
import { UserType, type SessionUser } from "@/store/api/auth/types";

const MAX_BYTES = 10 * 1024 * 1024;

const ProfilePhotoCard = ({ user }: { user: SessionUser }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [updateImage, { isLoading }] = useUpdateMyImageMutation();

  const pick = async (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 10 MB or smaller.");
      return;
    }

    const data = new FormData();
    data.append("image", file);

    try {
      await updateImage(data).unwrap();
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        <Avatar className="size-20">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-accent text-xl font-semibold text-accent-foreground">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1.5 text-center sm:text-left">
          <p className="truncate text-lg font-semibold">{user.name}</p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            <Badge variant="secondary">
              {user.userType === UserType.SuperAdmin ? "Super admin" : "Admin"}
            </Badge>
            {user.role && <Badge variant="outline">{user.role.name}</Badge>}
            <Badge variant={user.status === "active" ? "default" : "destructive"}>
              {user.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void pick(event.target.files?.[0])}
        />
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {isLoading ? "Uploading" : "Change photo"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfilePhotoCard;
