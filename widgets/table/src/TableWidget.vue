<template>
  <div class="widget widget-table">
    <h3 v-if="title">{{ title }}</h3>
    <table class="table">
      <thead>
        <tr><th v-for="col in data.columns" :key="col">{{ col }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data.rows" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'TableWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
};
</script>
