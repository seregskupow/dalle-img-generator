import { Alert, Animated, Image, StyleSheet, View } from "react-native";
import {
  Button,
  Snackbar,
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
import { OPENAI_API_KEY } from "@env";
import { Configuration, OpenAIApi } from "openai";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ScrollView = Animated.ScrollView;
import { SavedResult } from "../../models";

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const promptTemplate = (prompt: string): string =>
  "Enhance my AI image generation prompts by providing a more detailed prompt. I will give you a prompt like this:" +
  `Prompt: ${prompt}` +
  ".\n" +
  "\n" +
  "Follow these guidelines when responding with an enhanced prompt:\n" +
  "\n" +
  "1. Start with the prompt provided and add details to make it more interesting and creative but remain realistic.\n" +
  "2. Use relevant buzzwords related to settings, style, flare, or composition to enhance the prompt.\n" +
  "3. Put more emphasis on the words at the beginning of the prompt to set the theme and subject.\n" +
  "4. Use only the most important keywords and avoid using sentences or conjunctions.\n" +
  "5. Keep the enhanced prompt under 150 words and vary the keywords to avoid repetition.\n" +
  "6. Separate features with commas and never use periods.\n";

export function Imagine(): JSX.Element {
  const theme = useTheme();
  const [permissionResponse, requestPermission, getPermission] =
    MediaLibrary.usePermissions();

  const [prompt, setPrompt] = React.useState("");
  const [shouldEnchance, setShouldEnchance] = React.useState(false);
  const [generatingLoading, setigeneratingLoading] = React.useState(false);
  const [imgDownloading, setimgDownloading] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState("");
  const [error, setError] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [generatingStatus, setGeneratingStatus] = React.useState("");
  const onToggleSwitch = () => setShouldEnchance(!shouldEnchance);

  const handleDownload = async () => {
    setimgDownloading(true);
    let date = moment().format("YYYYMMDDhhmmss");
    let fileUri = FileSystem.documentDirectory + `${date}.jpg`;
    try {
      const res = await FileSystem.downloadAsync(generatedImage, fileUri);
      await saveFile(res.uri);
      setimgDownloading(false);
    } catch (err) {
      setimgDownloading(false);
      setError("Failed to download image");
      onShowSnackBar();
    }
  };

  const enhancePrompt = async (input: string) => {
    try {
      setGeneratingStatus("Enhancing your prompt");
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: promptTemplate(input),
          },
        ],
      });
      if (completion) {
        return completion?.data?.choices?.[0]?.message?.content as string;
      }
      return input;
    } catch (error) {
      setigeneratingLoading(false);
      setError("Failed to enhancePrompt");
      setGeneratingStatus("");
      onShowSnackBar();
      return input;
    }
  };

  const generateImage = async (enhance: boolean = true) => {
    try {
      setGeneratedImage("");
      setSaved(false);

      setigeneratingLoading(true);
      let imgPrompt = prompt;
      if (enhance) {
        imgPrompt = await enhancePrompt(imgPrompt);
        setPrompt(imgPrompt);
      }
      setGeneratingStatus("Generating masterpiece");
      const response = await openai.createImage({
        prompt: imgPrompt,
        n: 1,
        size: "512x512",
        response_format: "url",
      });

      if (response) {
        setGeneratedImage(response.data.data[0].url as string);
      }
      setigeneratingLoading(false);
    } catch (error) {
      setigeneratingLoading(false);
      setError("Failed to generate image");
      onShowSnackBar();
      setGeneratingStatus("");
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
      } catch (err) {
        setError("Failed to save file");
        setimgDownloading(false);
      }
    } else if (status === "undetermined" || status === "denied") {
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

  const saveResult = async (result: SavedResult) => {
    try {
      const value = await AsyncStorage.getItem("results");
      if (value !== null) {
        const results: SavedResult[] = JSON.parse(value);
        results.unshift(result);
        await AsyncStorage.setItem("results", JSON.stringify(results));
        setSaved(true);
        return;
      }
      const newResults = [result];
      await AsyncStorage.setItem("results", JSON.stringify(newResults));
      setSaved(true);
    } catch (e) {
      console.log(e);
      setError("Failed to save result");
      onShowSnackBar();
    }
  };

  const onShowSnackBar = () => setVisible(!visible);

  const onDismissSnackBar = () => setVisible(false);

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <TextInput
            label="Enter prompt"
            value={prompt}
            multiline
            maxLength={1000}
            mode="outlined"
            onChangeText={(text) => setPrompt(text)}
            theme={{ roundness: 10 }}
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
              marginBottom: 10,
              maxHeight: 150,
            }}
          />
          <View style={styles.btns}>
            <Button
              style={{ flex: 1 }}
              compact
              disabled={!prompt}
              icon="delete"
              mode="contained"
              onPress={() => setPrompt("")}
            >
              Clear
            </Button>
            <Button
              style={{ flex: 1 }}
              compact
              disabled={
                !prompt || generatingLoading || !Boolean(generatedImage)
              }
              icon="autorenew"
              mode="contained-tonal"
              onPress={() => generateImage(false)}
            >
              Regenerate
            </Button>
          </View>
          <View style={styles.enhance}>
            <Text variant="bodyLarge">Enhance prompt with AI?</Text>
            <Switch value={shouldEnchance} onValueChange={onToggleSwitch} />
          </View>

          <Button
            style={{ marginBottom: 20 }}
            mode="contained-tonal"
            disabled={!prompt || generatingLoading}
            loading={generatingLoading}
            onPress={() => generateImage(shouldEnchance)}
          >
            {generatingLoading
              ? generatingStatus
              : "Transform your ideas to a visual masterpiece!"}
          </Button>
          {generatedImage && (
            <>
              <Surface elevation={1} style={styles.surface}>
                <Image
                  defaultSource={require("../../assets/loading-placeholder.png")}
                  style={{
                    ...styles.resultImg,
                    ...{ backgroundColor: theme.colors.surface },
                  }}
                  source={{ uri: generatedImage }}
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
                  disabled={saved}
                  onPress={() => {
                    saveResult({
                      prompt,
                      image: generatedImage,
                    });
                  }}
                >
                  Save result
                </Button>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <Snackbar
        visible={visible}
        wrapperStyle={{ bottom: 0 }}
        onDismiss={onDismissSnackBar}
      >
        {error}
      </Snackbar>
    </>
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
});
