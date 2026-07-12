<script>
  import { BUTTON_STYLE } from '../lib/uiConstants.js';

  let { text } = $props();
  let label = $state('Copy prompt');
  let timer;

  async function handleCopy() {
    if (timer) clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(text);
      label = 'Copied';
    } catch {
      label = 'Copy failed, select the text manually';
    }
    timer = setTimeout(() => {
      label = 'Copy prompt';
    }, 2000);
  }
</script>

<button type="button" onclick={handleCopy} style={BUTTON_STYLE}>
  {label}
</button>
