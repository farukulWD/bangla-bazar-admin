"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/store/api/auth/hooks/use-session";

import { EmailChangeCard, PhoneChangeCard } from "./contact-cards";
import ProfileDetailsForm from "./profile-details-form";
import ProfilePhotoCard from "./profile-photo-card";

const ProfileView = () => {
  const { user, isLoading } = useSession();

  if (isLoading || !user) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Profile" description="Manage your own account." />

      <div className="space-y-6">
        <ProfilePhotoCard user={user} />
        <ProfileDetailsForm user={user} />
        <EmailChangeCard user={user} />
        <PhoneChangeCard user={user} />

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Changing it signs you out of this session.
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/settings/change-password" />}
                nativeButton={false}
              >
                <KeyRound />
                Change password
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default ProfileView;
