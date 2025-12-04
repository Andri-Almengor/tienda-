import { Providers } from "./src/app/providers";
import { AppNavigator } from "./src/app/AppNavigator";

export default function App() {
  return (
    <Providers>
      <AppNavigator />
    </Providers>
  );
}
