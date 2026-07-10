"use client";

import { useSession } from "@/services/session/public/session-provider";
import { Button } from "@/shared/ui/button";

export const Profile = () => {
  const { email } = useSession();

  return (
    <section aria-labelledby="profile-heading">
      <h2 id="profile-heading">Profile</h2>
      <p>Signed in as {email}</p>
      <Button label="Edit profile" />
    </section>
  );
};
