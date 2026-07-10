<script setup lang="ts">
import Badge from "@/shared/ui/badge.vue";
import Button from "@/shared/ui/button.vue";
import Card from "@/shared/ui/card.vue";
import { useNotifications } from "../use-notifications";

const { items, markAllRead, markRead, unread } = useNotifications();
</script>

<template>
  <section class="notifications" aria-labelledby="notifications-heading">
    <header class="notifications-header">
      <div>
        <h2 id="notifications-heading">Notifications</h2>
        <p>Colocated composable — wired from app when catalog adds to cart.</p>
      </div>
      <Badge v-if="unread > 0" variant="accent">{{ unread }} unread</Badge>
    </header>

    <ul class="notifications-list">
      <li v-for="item in items" :key="item.id">
        <Card :card-class="item.read ? 'notification--read' : undefined">
          <p>{{ item.message }}</p>
          <p v-if="item.read" class="notification-status">Read</p>
          <Button
            v-else
            label="Mark read"
            variant="secondary"
            @click="markRead(item.id)"
          />
        </Card>
      </li>
    </ul>

    <footer v-if="unread > 0">
      <Button label="Mark all read" variant="secondary" @click="markAllRead" />
    </footer>
  </section>
</template>

<style scoped>
.notifications-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	margin-bottom: 1rem;
}

.notifications-list {
	display: grid;
	gap: 0.75rem;
	margin: 0;
	padding: 0;
	list-style: none;
}

.notification--read {
	opacity: 0.7;
}

.notification-status {
	margin: 0.5rem 0 0;
	color: #64748b;
	font-size: 0.875rem;
}
</style>
