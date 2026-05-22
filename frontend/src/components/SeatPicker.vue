<template>
  <div class="seat-picker">
    <!-- Ekran kinowy -->
    <div class="screen-wrapper">
      <div class="screen">EKRAN</div>
    </div>

    <!-- Mapa miejsc -->
    <div class="seats-grid">
      <div v-for="row in rows" :key="row" class="seat-row">
        <span class="row-label">{{ row }}</span>
        <div class="seats">
          <button
            v-for="seat in 10"
            :key="`${row}-${seat}`"
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

    <!-- Legenda -->
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

    <!-- Podsumowanie wyboru -->
    <div v-if="selected" class="selection-summary glass-card">
      <div class="summary-info">
        <span class="summary-label">Twój wybór:</span>
        <span class="summary-seat">Rząd {{ selected.row }}, Miejsce {{ selected.seat }}</span>
      </div>
      <button class="btn btn-primary" @click="$emit('confirm', selected)" :disabled="loading">
        {{ loading ? 'Rezerwuję...' : 'Potwierdź rezerwację ✓' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  takenSeats: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['confirm']);

const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
const selected = ref(null);

function isTaken(row, seat) {
  return props.takenSeats.some((s) => s.row === row && s.seatNumber === seat);
}

function isSelected(row, seat) {
  return selected.value?.row === row && selected.value?.seat === seat;
}

function toggleSeat(row, seat) {
  if (isTaken(row, seat)) return;
  if (isSelected(row, seat)) {
    selected.value = null;
  } else {
    selected.value = { row, seat };
  }
}
</script>

<style scoped>
.seat-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.screen-wrapper {
  width: 100%;
  max-width: 500px;
  perspective: 300px;
}

.screen {
  width: 100%;
  padding: 8px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--text-muted);
  background: linear-gradient(180deg, rgba(212, 168, 67, 0.2), transparent);
  border-top: 3px solid var(--accent-gold);
  border-radius: 4px 4px 50% 50%;
  transform: rotateX(-15deg);
}

.seats-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-label {
  width: 20px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.seats {
  display: flex;
  gap: 6px;
}

.seat {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px 6px 10px 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.seat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 3px;
  right: 3px;
  height: 5px;
  border-radius: 4px 4px 0 0;
  background: inherit;
  filter: brightness(0.7);
}

.seat-available {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.seat-available:hover {
  background: rgba(124, 58, 237, 0.3);
  color: white;
  transform: scale(1.1);
}

.seat-selected {
  background: linear-gradient(135deg, var(--accent-gold), #c4942e);
  color: #0a0a1a;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(212, 168, 67, 0.4);
}

.seat-taken {
  background: rgba(239, 68, 68, 0.25);
  color: rgba(239, 68, 68, 0.5);
  cursor: not-allowed;
}

.legend {
  display: flex;
  gap: 24px;
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

.selection-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 28px;
  width: 100%;
  max-width: 500px;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.summary-seat {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--accent-gold-light);
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

  .selection-summary {
    flex-direction: column;
    text-align: center;
  }
}
</style>
