import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (time: { hour: number; minute: number }) => void;
  initialTime?: { hour: number; minute: number };
}

const { height: screenHeight } = Dimensions.get("window");
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export default function TimePickerModal({
  visible,
  onClose,
  onSave,
  initialTime = { hour: 12, minute: 0 },
}: TimePickerModalProps) {
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (visible) {
      // Scroll to initial positions when modal opens
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: selectedHour * ITEM_HEIGHT,
          animated: false,
        });
        minuteScrollRef.current?.scrollTo({
          y: selectedMinute * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [visible, selectedHour, selectedMinute]);

  const handleHourScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, hours.length - 1));
    setSelectedHour(hours[clampedIndex]);
  };

  const handleMinuteScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, minutes.length - 1));
    setSelectedMinute(minutes[clampedIndex]);
  };

  const handleSave = () => {
    onSave({ hour: selectedHour, minute: selectedMinute });
    onClose();
  };

  const renderPickerItem = (
    value: number,
    isSelected: boolean,
    type: "hour" | "minute"
  ) => {
    const displayValue =
      type === "hour"
        ? value.toString().padStart(2, "0")
        : value.toString().padStart(2, "0");

    return (
      <View key={value} style={styles.pickerItem}>
        <Text
          style={[
            styles.pickerItemText,
            isSelected && styles.selectedPickerItemText,
          ]}
        >
          {displayValue}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            {/* Hour Picker */}
            <View style={styles.pickerColumn}>
              <ScrollView
                ref={hourScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleHourScroll}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Padding items for proper centering */}
                {Array.from({ length: Math.floor(VISIBLE_ITEMS / 2) }).map(
                  (_, i) => (
                    <View
                      key={`hour-padding-top-${i}`}
                      style={styles.pickerItem}
                    />
                  )
                )}

                {hours.map((hour) =>
                  renderPickerItem(hour, hour === selectedHour, "hour")
                )}

                {/* Padding items for proper centering */}
                {Array.from({ length: Math.floor(VISIBLE_ITEMS / 2) }).map(
                  (_, i) => (
                    <View
                      key={`hour-padding-bottom-${i}`}
                      style={styles.pickerItem}
                    />
                  )
                )}
              </ScrollView>
            </View>

            {/* Colon Separator */}
            <View style={styles.separator}>
              <Text style={styles.colonText}>:</Text>
            </View>

            {/* Minute Picker */}
            <View style={styles.pickerColumn}>
              <ScrollView
                ref={minuteScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleMinuteScroll}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Padding items for proper centering */}
                {Array.from({ length: Math.floor(VISIBLE_ITEMS / 2) }).map(
                  (_, i) => (
                    <View
                      key={`minute-padding-top-${i}`}
                      style={styles.pickerItem}
                    />
                  )
                )}

                {minutes.map((minute) =>
                  renderPickerItem(minute, minute === selectedMinute, "minute")
                )}

                {/* Padding items for proper centering */}
                {Array.from({ length: Math.floor(VISIBLE_ITEMS / 2) }).map(
                  (_, i) => (
                    <View
                      key={`minute-padding-bottom-${i}`}
                      style={styles.pickerItem}
                    />
                  )
                )}
              </ScrollView>
            </View>

            {/* Selection Indicator */}
            <View style={styles.selectionIndicator} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#2C2C2E",
    borderRadius: 14,
    width: 280,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#48484A",
  },
  cancelButton: {
    color: "#FF9F0A",
    fontSize: 17,
    fontWeight: "400",
  },
  saveButton: {
    color: "#FF9F0A",
    fontSize: 17,
    fontWeight: "600",
  },
  pickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  pickerColumn: {
    flex: 1,
    height: "100%",
  },
  separator: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  colonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "300",
  },
  scrollContent: {
    paddingVertical: 0,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 24,
    color: "#8E8E93",
    fontWeight: "300",
  },
  selectedPickerItemText: {
    color: "#FFFFFF",
    fontWeight: "400",
  },
  selectionIndicator: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#48484A",
    pointerEvents: "none",
  },
});
