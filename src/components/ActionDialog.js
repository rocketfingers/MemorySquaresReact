import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ActionDialog({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
  showCancel = true,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={destructive ? ["#ef4444", "#f87171"] : ["#6366f1", "#818cf8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.actions}>
              {showCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelBtn]}
                  onPress={onCancel}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, destructive ? styles.dangerBtn : styles.primaryBtn]}
                onPress={onConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 40,
    elevation: 12,
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  message: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  actions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  button: {
    minWidth: 118,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#e2e8f0",
  },
  dangerBtn: {
    backgroundColor: "#ef4444",
  },
  primaryBtn: {
    backgroundColor: "#6366f1",
  },
  cancelText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
