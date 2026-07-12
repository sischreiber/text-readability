<script>
  let { value, flashOnChange = false, flashToggle = 0 } = $props();

  let anim = $state(null);
  let prev = $state(null);

  $effect(() => {
    if (prev === null) {
      prev = value;
      return;
    }
    if (!flashOnChange || prev === value) {
      prev = value;
      return;
    }
    anim = flashToggle % 2 === 0 ? 'flashA' : 'flashB';
    prev = value;
    const timer = setTimeout(() => {
      anim = null;
    }, 600);
    return () => clearTimeout(timer);
  });
</script>

<span
  style="font-weight:700;font-variant-numeric:tabular-nums;{anim
    ? `animation:${anim} 0.6s ease`
    : ''}"
>
  {value}
</span>
