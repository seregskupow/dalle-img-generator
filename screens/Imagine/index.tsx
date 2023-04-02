import { Alert, Animated, Image, StyleSheet, View } from "react-native";
import {
  Button,
  Surface,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import React from "react";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import moment from "moment";

import ScrollView = Animated.ScrollView;

export function Imagine(): JSX.Element {
  const theme = useTheme();
  const [permissionResponse, requestPermission, getPermission] =
    MediaLibrary.usePermissions();

  const [text, setText] = React.useState("");
  const [shouldEnchance, setShouldEnchance] = React.useState(false);
  const [generatingLoading, setigeneratingLoading] = React.useState(false);
  const [imgDownloading, setimgDownloading] = React.useState(false);
  const onToggleSwitch = () => setShouldEnchance(!shouldEnchance);

  const imageUrl = {
    uri: "https://picsum.photos/200/300",
  };

  const handleDownload = async () => {
    let date = moment().format("YYYYMMDDhhmmss");
    let fileUri = FileSystem.documentDirectory + `${date}.jpg`;
    try {
      const res = await FileSystem.downloadAsync(imageUrl.uri, fileUri);
      saveFile(res.uri);
    } catch (err) {
      console.log("FS Err: ", err);
    }
  };

  const saveFile = async (fileUri: string) => {
    setimgDownloading(true);
    const { status } = await getPermission();
    console.log(status);
    if (status === "granted") {
      try {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        const album = await MediaLibrary.getAlbumAsync("Imagine");
        if (album == null) {
          await MediaLibrary.createAlbumAsync("Imagine", asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        setimgDownloading(false);
      } catch (err) {
        console.log("Save err: ", err);
        setimgDownloading(false);
      }
    } else if (status === "undetermined") {
      setimgDownloading(false);
      Alert.alert("Oops", "Please allow permissions to download", [
        {
          text: "Grant permissions",
          onPress: () => {
            requestPermission();
          },
        },
        { text: "Dismiss", onPress: () => {} },
      ]);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <TextInput
          label="Enter prompt"
          value={text}
          multiline
          maxLength={200}
          mode="outlined"
          onChangeText={(text) => setText(text)}
          theme={{ roundness: 10 }}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary,
          }}
        />
        <View style={styles.enhance}>
          <Text variant="bodyLarge">Enhance prompt with AI?</Text>
          <Switch value={shouldEnchance} onValueChange={onToggleSwitch} />
        </View>

        <Button
          style={{ marginBottom: 20 }}
          mode="contained-tonal"
          loading={generatingLoading}
          onPress={() => console.log("Pressed")}
        >
          Bring your ideas to visual masterpiece!
        </Button>

        <Surface elevation={1} style={styles.surface}>
          <Image
            style={styles.resultImg}
            source={{ uri: "https://picsum.photos/200/300" }}
          />
        </Surface>
        <View style={styles.btns}>
          <Button
            style={{ flex: 1 }}
            loading={imgDownloading}
            icon="download"
            mode="contained"
            onPress={() => handleDownload()}
          >
            Download image
          </Button>
          <Button
            style={{ flex: 1 }}
            icon="bookmark"
            mode="contained-tonal"
            onPress={() => {}}
          >
            Save result
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  enhance: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  resultImg: {
    width: "100%",
    height: "100%",
  },
  surface: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    width: "100%",
    height: 300,
    overflow: "hidden",
    marginBottom: 20,
  },
  btns: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
});
