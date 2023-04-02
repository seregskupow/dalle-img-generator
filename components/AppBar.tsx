import * as React from "react";
import { Appbar, Avatar } from "react-native-paper";
import { StyleSheet, View } from "react-native";

const AppBar = () => {
  return (
    <Appbar.Header>
      {/*<Appbar.Content title={route.name} />*/}
      <View style={styles.container}>
        <Avatar.Icon size={40} icon="account-circle" />
      </View>
    </Appbar.Header>
  );
};

export default AppBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
});
