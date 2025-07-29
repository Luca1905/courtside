import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import TimePickerModal from "~/components/TimePicker";

export default function App() {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState({ hour: 12, minute: 0 });

  const handleTimeSelect = (time: { hour: number; minute: number }) => {
    setSelectedTime(time);
  };

  const formatTime = (time: { hour: number; minute: number }) => {
    const hour12 =
      time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
    const ampm = time.hour >= 12 ? "PM" : "AM";
    return `${hour12.toString().padStart(2, "0")}:${time.minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        <Text style={styles.title}>iOS Time Picker Demo</Text>

        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timeButtonText}>
            Selected Time: {formatTime(selectedTime)}
          </Text>
          <Text style={styles.tapText}>Tap to change</Text>
        </TouchableOpacity>
      </View>

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSave={handleTimeSelect}
        initialTime={selectedTime}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 40,
    textAlign: "center",
  },
  timeButton: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  timeButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  tapText: {
    fontSize: 16,
    color: "#8E8E93",
  },
});
