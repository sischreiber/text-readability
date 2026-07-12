<script>
  import { IN_TEXT_BOX_STYLE } from '../lib/uiConstants.js';
  import { segmentStyle } from '../lib/highlightHelpers.js';

  const TOOLTIP_DELAY_MS = 200;

  let {
    segments,
    getBackground = () => undefined,
    getTooltip = () => null,
  } = $props();

  let tooltip = $state(null);
  let showTimer;

  function clearTooltipTimer() {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = undefined;
    }
  }

  function hideTooltip() {
    clearTooltipTimer();
    tooltip = null;
  }

  function showTooltip(label, event) {
    clearTooltipTimer();
    showTimer = setTimeout(() => {
      tooltip = {
        label,
        x: event.clientX,
        y: event.clientY,
      };
    }, TOOLTIP_DELAY_MS);
  }

  function handleWordEnter(seg, event) {
    const label = getTooltip(seg);
    if (!label) return;
    showTooltip(label, event);
  }

  function handleWordMove(event) {
    if (!tooltip) return;
    tooltip = {
      label: tooltip.label,
      x: event.clientX,
      y: event.clientY,
    };
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div style={IN_TEXT_BOX_STYLE} onmouseleave={hideTooltip}>
  {#each segments as seg, i (i)}
    {#if seg.type === 'gap'}
      <span style={segmentStyle()}>{seg.text}</span>
    {:else}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span
        style={segmentStyle(getBackground(seg))}
        onmouseenter={(event) => handleWordEnter(seg, event)}
        onmousemove={handleWordMove}
        onmouseleave={hideTooltip}
      >
        {seg.text}
      </span>
    {/if}
  {/each}
</div>

{#if tooltip}
  <div
    role="tooltip"
    style="position:fixed;left:{tooltip.x + 10}px;top:{tooltip.y - 28}px;pointer-events:none;font-size:0.75rem;line-height:1.2;padding:0.25rem 0.45rem;background:#212121;color:#fff;border-radius:3px;white-space:nowrap;z-index:1000"
  >
    {tooltip.label}
  </div>
{/if}
