import "react-native-url-polyfill/auto";
import { NavigationContainer } from "@react-navigation/native";
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
  useTheme,
} from "react-native-paper";
import AppBar from "./components/AppBar";
import Routes from "./routes";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <AppBar />
        <Routes />
      </PaperProvider>
    </NavigationContainer>
  );
}
