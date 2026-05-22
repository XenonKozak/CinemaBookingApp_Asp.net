import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { theme } from '../theme/theme';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 10;
const ROW_LABEL_WIDTH = 22;
const SEAT_GAP = 5;
const GRID_HORIZONTAL_PADDING = 32;

function seatKey(row, seat) {
  return `${row}-${seat}`;
}

function SeatButton({ seat, taken, selected, size, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.seat,
        { width: size, height: size },
        taken && styles.seatTaken,
        selected && styles.seatSelected,
        !taken && !selected && styles.seatAvailable,
      ]}
      onPress={onPress}
      disabled={taken}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.seatNum,
          { fontSize: size < 30 ? 10 : 11 },
          selected && styles.seatNumSelected,
          taken && styles.seatNumTaken,
        ]}
      >
        {seat}
      </Text>
    </TouchableOpacity>
  );
}

export default function SeatPicker({ takenSeats = [], selectedSeats = [], onSelectionChange }) {
  const { width: screenWidth } = useWindowDimensions();

  const seatSize = useMemo(() => {
    const available =
      screenWidth - GRID_HORIZONTAL_PADDING - ROW_LABEL_WIDTH * 2 - (SEATS_PER_ROW - 1) * SEAT_GAP;
    const computed = Math.floor(available / SEATS_PER_ROW);
    return Math.max(26, Math.min(36, computed));
  }, [screenWidth]);

  const seatsBlockWidth = SEATS_PER_ROW * seatSize + (SEATS_PER_ROW - 1) * SEAT_GAP;
  const rowWidth = ROW_LABEL_WIDTH * 2 + seatsBlockWidth;

  const isTaken = (row, seat) =>
    takenSeats.some((s) => s.row === row && s.seatNumber === seat);

  const isSelected = (row, seat) =>
    selectedSeats.some((s) => s.row === row && s.seat === seat);

  const toggleSeat = (row, seat) => {
    if (isTaken(row, seat)) return;
    if (isSelected(row, seat)) {
      onSelectionChange(selectedSeats.filter((s) => !(s.row === row && s.seat === seat)));
    } else {
      onSelectionChange([...selectedSeats, { row, seat }]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.screenBar, { width: rowWidth }]}>
        <Text style={styles.screenLabel}>EKRAN</Text>
      </View>

      <View style={[styles.seatsGrid, { width: rowWidth }]}>
        {ROWS.map((row, rowIndex) => (
          <View
            key={row}
            style={[styles.seatRow, rowIndex < ROWS.length - 1 && styles.seatRowSpacing]}
          >
            <Text style={styles.rowLabel}>{row}</Text>
            <View style={[styles.seats, { width: seatsBlockWidth }]}>
              {Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1).map((seat, seatIndex) => (
                <View
                  key={seatKey(row, seat)}
                  style={seatIndex < SEATS_PER_ROW - 1 ? styles.seatCell : undefined}
                >
                  <SeatButton
                    seat={seat}
                    taken={isTaken(row, seat)}
                    selected={isSelected(row, seat)}
                    size={seatSize}
                    onPress={() => toggleSeat(row, seat)}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.rowLabel}>{row}</Text>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.seatAvailable]} />
          <Text style={styles.legendText}>Dostępne</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.seatSelected]} />
          <Text style={styles.legendText}>Wybrane</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.seatTaken]} />
          <Text style={styles.legendText}>Zajęte</Text>
        </View>
      </View>

      <Text style={styles.hint}>Możesz wybrać kilka miejsc — dotknij ponownie, aby odznaczyć</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
  },
  screenBar: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderTopWidth: 3,
    borderTopColor: theme.colors.accentGold,
    backgroundColor: 'rgba(212, 168, 67, 0.1)',
    borderRadius: 6,
  },
  screenLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    color: theme.colors.textMuted,
  },
  seatsGrid: {
    marginBottom: 20,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatRowSpacing: {
    marginBottom: 8,
  },
  rowLabel: {
    width: ROW_LABEL_WIDTH,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  seats: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  seatCell: {
    marginRight: SEAT_GAP,
  },
  seat: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatAvailable: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  seatSelected: {
    backgroundColor: theme.colors.accentGold,
  },
  seatTaken: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  seatNum: {
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  seatNumSelected: {
    color: '#0a0a1a',
  },
  seatNumTaken: {
    color: 'rgba(239, 68, 68, 0.5)',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 4,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
