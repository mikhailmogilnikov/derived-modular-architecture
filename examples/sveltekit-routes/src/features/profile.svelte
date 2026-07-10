<script lang="ts">
import Button from "@/shared/ui/button.svelte";
import Card from "@/shared/ui/card.svelte";

let name = $state("Guest");

function handleEdit() {
  name = name === "Guest" ? "Alex" : "Guest";
}
</script>

<section class="profile" id="profile">
  <Card title="Profile">
    <p class="greeting">Signed in as <strong>{name}</strong></p>
    <Button label="Edit profile" onclick={handleEdit} />
  </Card>
</section>

<style>
  .greeting {
    margin: 0 0 1rem;
  }
</style>
