import { useColorMode, Switch, Box } from "@chakra-ui/react";
import { Moon, Sun } from "phosphor-react";

const ThemeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <Switch
      position={"relative"}
      size="lg"
      colorScheme="whiteAlpha"
      isChecked={isDark}
      onChange={toggleColorMode}
    >
      <Box
        display={colorMode === "light" ? "none" : ""}
        position={"absolute"}
        top="15%"
        left="5%"
      >
        <Sun size={20} color="#e9c46a" weight="fill" />
      </Box>
      <Box
        display={colorMode === "dark" ? "none" : ""}
        position={"absolute"}
        top="15%"
        right="15%"
      >
        <Moon size={20} color="#292E1E" weight="fill" />
      </Box>
    </Switch>
  );
};

export default ThemeSwitch;
