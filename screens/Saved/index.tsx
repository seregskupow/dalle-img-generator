import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import React from "react";

export function Saved(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
