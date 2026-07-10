import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import styles from "./profile.module.scss";

const profile = {
  email: "morgan@example.com",
  memberSince: "2024",
  name: "Morgan Lee",
  plan: "Pro",
} as const;

export const Profile = () => (
  <section aria-labelledby="profile-heading">
    <Card>
      <header className={styles.cardHeader}>
        <p aria-hidden="true" className={styles.avatar}>
          ML
        </p>
        <div>
          <h2 id="profile-heading">Profile</h2>
          <p>Account overview</p>
        </div>
      </header>

      <dl>
        <div>
          <dt>Name</dt>
          <dd>{profile.name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </dd>
        </div>
        <div>
          <dt>Plan</dt>
          <dd>{profile.plan}</dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{profile.memberSince}</dd>
        </div>
      </dl>

      <Button label="Edit profile" />
    </Card>
  </section>
);
