import { Alert, Animated, StyleSheet, View } from "react-native";
import { Button, Card, FAB, Text, useTheme } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SavedResult } from "../../models";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScrollView = Animated.ScrollView;
import * as MediaLibrary from "expo-media-library";
import moment from "moment/moment";
import * as FileSystem from "expo-file-system";

export function Saved(): JSX.Element {
  const theme = useTheme();
  const [permissionResponse, requestPermission, getPermission] =
    MediaLibrary.usePermissions();

  const navigation = useNavigation();
  const [results, setResults] = useState<SavedResult[]>([]);
  const [error, setError] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [imgDownloading, setimgDownloading] = useState(false);
  const [dwnloadIndex, setDwnloadindex] = useState(-1);

  const getResults = async () => {
    try {
      const value = await AsyncStorage.getItem("results");
      if (!value) return;
      setResults(JSON.parse(value));
    } catch (e) {
      setError("Failed to save result");
      onShowSnackBar();
    }
  };
  const onShowSnackBar = () => setVisible(!visible);

  const handleDownload = async (img: string, fileIndex: number) => {
    setimgDownloading(true);
    setDwnloadindex(fileIndex);
    let date = moment().format("YYYYMMDDhhmmss");
    let fileUri = FileSystem.documentDirectory + `${date}.jpg`;
    try {
      const res = await FileSystem.downloadAsync(img, fileUri);
      await saveFile(res.uri);
      setimgDownloading(false);
    } catch (err) {
      setimgDownloading(false);
      setDwnloadindex(-1);
      setError("Failed to download image");
      onShowSnackBar();
    }
  };

  const saveFile = async (fileUri: string) => {
    const { status } = await getPermission();

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
        setDwnloadindex(-1);
      } catch (err) {
        setError("Failed to save file");
        setimgDownloading(false);
        setDwnloadindex(-1);
      }
    } else if (status === "undetermined") {
      setimgDownloading(false);
      setDwnloadindex(-1);
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

  const onClear = async () => {
    try {
      await AsyncStorage.removeItem("results");
      setResults([]);
    } catch (e) {
      setError("Failed to clear history");
      onShowSnackBar();
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await getResults();
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {results.length ? (
        <>
          <FAB icon="delete" style={styles.fab} onPress={() => onClear()} />
          <ScrollView style={{ padding: 8 }}>
            {results.map((result: SavedResult, index) => (
              <View style={{ marginBottom: 20 }} key={index}>
                <Card style={{ backgroundColor: theme.colors.surface }}>
                  <Card.Content>
                    <Text
                      style={{ color: theme.colors.primary }}
                      variant="titleLarge"
                    >
                      Prompt:
                    </Text>
                    <Text style={{ marginBottom: 10 }} variant="bodyMedium">
                      {result.prompt}
                    </Text>
                  </Card.Content>
                  <Card.Cover source={{ uri: result.image }} />
                  <Card.Actions>
                    <Button
                      style={{ flex: 1 }}
                      loading={imgDownloading && index === dwnloadIndex}
                      icon="download"
                      mode="contained"
                      onPress={() => handleDownload(result.image, index)}
                    >
                      Download image
                    </Button>
                  </Card.Actions>
                </Card>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.container}>
          <Text variant="headlineMedium">Oops, there is empty(</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultImg: {
    width: "100%",
    aspectRatio: 1 / 1,
  },
  surface: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    width: "100%",
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
});
