import { Image } from "expo-image";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const ContentPhoto = ({
  uri,
  label,
  height = 360,
  recyclingKey,
}: {
  uri?: string | null;
  label: string;
  height?: number;
  recyclingKey?: string;
}) => {
  const photoStyle = height > 200 ? styles.photoLarge : styles.photoSmall;
  const fallbackStyle = height > 200 ? styles.photoFallbackLarge : styles.photoFallbackSmall;
  if (!uri) {
    return (
      <View style={fallbackStyle}>
        <Text style={styles.photoFallbackText}>{label}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={label}
      contentFit="cover"
      recyclingKey={recyclingKey}
      source={{ uri }}
      style={photoStyle}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  photoLarge: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 20,
    height: 360,
    width: "100%",
  },
  photoSmall: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 16,
    height: 144,
    width: "100%",
  },
  photoFallbackLarge: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 20,
    height: 360,
    justifyContent: "center",
    width: "100%",
  },
  photoFallbackSmall: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 16,
    height: 144,
    justifyContent: "center",
    width: "100%",
  },
  photoFallbackText: {
    color: theme.colors.muted,
    fontSize: 15,
    textAlign: "center",
  },
}));

export default ContentPhoto;
