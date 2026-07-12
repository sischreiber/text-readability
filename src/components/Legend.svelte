<script>
  let { items, activeKey = $bindable(null), interactive = false } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  style="display:flex;flex-wrap:wrap;gap:0.65rem 1rem;margin-bottom:0.55rem;font-size:0.8rem;color:#555"
  onmouseleave={interactive ? () => (activeKey = null) : undefined}
>
  {#each items as item (item.key ?? item.label)}
    {@const disabled = item.disabled === true}
    {@const dimmed =
      !disabled && interactive && activeKey !== null && activeKey !== item.key}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      style="display:flex;align-items:center;gap:0.4rem;opacity:{disabled
        ? 0.35
        : dimmed
          ? 0.45
          : 1};transition:opacity 0.15s ease"
      onmouseenter={interactive && !disabled ? () => (activeKey = item.key) : undefined}
    >
      <span
        style="width:0.9rem;height:0.9rem;border-radius:3px;border:1px solid #d0d0d0;background:{disabled
          ? '#e8e8e8'
          : (item.color ?? 'transparent')};flex-shrink:0"
      ></span>
      <span>{item.label}</span>
    </div>
  {/each}
</div>
