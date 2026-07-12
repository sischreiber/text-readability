<script>
  let { rows, activeIndex, columns } = $props();
</script>

<table style="border-collapse:collapse;font-size:1rem;width:100%">
  <thead>
    <tr>
      {#each columns as col}
        <th
          style="border:1px solid #d9d9d9;padding:0.7rem 1.4rem 0.7rem 0.9rem;text-align:left;font-weight:700"
        >
          {col}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each rows as row, index}
      {@const active = index === activeIndex}
      <tr>
        <td
          style="border:1px solid #d9d9d9;padding:0.7rem 1.4rem 0.7rem 0.9rem;background:{active
            ? '#e9e9e9'
            : '#fff'};font-weight:{active ? 700 : 400}"
        >
          {row.range}
        </td>
        <td
          style="border:1px solid #d9d9d9;padding:0.7rem 1.4rem 0.7rem 0.9rem;background:{active
            ? '#e9e9e9'
            : '#fff'};font-weight:{active ? 700 : 400}"
        >
          {row.label}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
