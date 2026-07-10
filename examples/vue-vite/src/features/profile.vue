<script setup lang="ts">
import { inject } from "vue";
import { shopThemeKey } from "@/shared/domain/shop-theme";
import Button from "@/shared/ui/button.vue";
import Card from "@/shared/ui/card.vue";

const theme = inject(shopThemeKey);

const profile = {
	email: "morgan@example.com",
	memberSince: "2024",
	name: "Morgan Lee",
	plan: "Pro",
} as const;
</script>

<template>
  <section class="profile" aria-labelledby="profile-heading">
    <Card>
      <header class="profile-header">
        <p aria-hidden="true" class="profile-avatar">ML</p>
        <div>
          <h2 id="profile-heading">Profile</h2>
          <p>Account overview — theme via <code>inject</code> from app providers.</p>
        </div>
      </header>

      <dl class="profile-details">
        <div>
          <dt>Name</dt>
          <dd>{{ profile.name }}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          </dd>
        </div>
        <div>
          <dt>Plan</dt>
          <dd>
            <span
              class="profile-plan"
              :style="theme ? { backgroundColor: `${theme.accentColor}22`, color: theme.accentColor } : undefined"
            >
              {{ profile.plan }}
            </span>
          </dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{{ profile.memberSince }}</dd>
        </div>
      </dl>

      <Button label="Edit profile" />
    </Card>
  </section>
</template>

<style lang="scss" scoped>
.profile-header {
	display: flex;
	gap: 1rem;
	margin-bottom: 1rem;

	h2 {
		margin: 0 0 0.25rem;
	}

	p {
		margin: 0;
		color: var(--color-muted);
	}
}

.profile-avatar {
	display: grid;
	place-items: center;
	width: 3rem;
	height: 3rem;
	margin: 0;
	border-radius: 9999px;
	background: var(--color-border);
	font-weight: 700;
}

.profile-details {
	display: grid;
	gap: 0.75rem;
	margin: 0 0 1rem;

	dt {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
	}

	dd {
		margin: 0.125rem 0 0;
	}
}

.profile-plan {
	display: inline-block;
	padding: 0.125rem 0.5rem;
	border-radius: 9999px;
	background: var(--color-accent-soft);
	color: #1d4ed8;
	font-size: 0.75rem;
	font-weight: 600;
}
</style>
