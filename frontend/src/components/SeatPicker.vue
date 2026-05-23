<template>
  <div class="seat-picker">
    <div class="screen-bar">
      <span class="screen-label">EKRAN</span>
    </div>

    <div class="seats-grid">
      <div v-for="row in rows" :key="row" class="seat-row">
        <span class="row-label">{{ row }}</span>
        <div class="seats">
          <button
            v-for="seat in 10"
            :key="`${row}-${seat}`"
            type="button"
            class="seat"
            :class="{
              'seat-taken': isTaken(row, seat),
              'seat-selected': isSelected(row, seat),
              'seat-available': !isTaken(row, seat) && !isSelected(row, seat),
            }"
            :disabled="isTaken(row, seat)"
            @click="toggleSeat(row, seat)"
            :title="isTaken(row, seat) ? 'Zajęte' : `Rząd ${row}, Miejsce ${seat}`"
          >
            {{ seat }}
          </button>
        </div>
        <span class="row-label">{{ row }}</span>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-dot seat-available"></span>
        <span>Dostępne</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot seat-selected"></span>
        <span>Wybrane</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot seat-taken"></span>
        <span>Zajęte</span>
      </div>
    </div>

    <p class="hint">Możesz wybrać kilka miejsc — kliknij ponownie, aby odznaczyć</p>
  </div>
</template>

<script setup>
const props = defineProps({
  takenSeats: {
    type: Array,
    default: () => [],
  },
  selectedSeats: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:selectedSeats']);

const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

function isTaken(row, seat) {
  return props.takenSeats.some((s) => s.row === row && s.seatNumber === seat);
}

function isSelected(row, seat) {
  return props.selectedSeats.some((s) => s.row === row && s.seat === seat);
}

function toggleSeat(row, seat) {
  if (isTaken(row, seat)) return;

  if (isSelected(row, seat)) {
    emit(
      'update:selectedSeats',
      props.selectedSeats.filter((s) => !(s.row === row && s.seat === seat))
    );
  } else {
    emit('update:selectedSeats', [...props.selectedSeats, { row, seat }]);
  }
}
</script>

<style scoped>
.seat-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.screen-bar {
  width: 100%;
  max-width: 500px;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--accent-purple), transparent);
  margin-bottom: 32px;
  position: relative;
  border-radius: 4px;
}

.screen-label {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text-secondary);
}

.seats-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 500px;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.row-label {
  width: 22px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.seats {
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
  justify-content: center;
}

.seat {
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.seat-available {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.1);
}

.seat-available:hover:not(:disabled) {
  background: var(--accent-purple);
  color: white;
  border-color: var(--accent-purple);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
}

.seat-selected {
  background: var(--accent-gold);
  color: #000;
  border-color: var(--accent-gold);
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.seat-taken {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  cursor: not-allowed;
  opacity: 0.8;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
}

.hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
}

@media (max-width: 500px) {
  .seat {
    width: 28px;
    height: 28px;
    font-size: 0.65rem;
  }

  .seats {
    gap: 4px;
  }
}
</style>
