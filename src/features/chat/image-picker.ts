import * as ImagePicker from "expo-image-picker";

export type PickedImage = {
  body: Blob;
  contentType: string;
  filename: string;
};

export async function pickImageAttachment(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset?.uri) {
    return null;
  }

  const response = await fetch(asset.uri);
  const body = await response.blob();
  const contentType = asset.mimeType ?? "image/jpeg";

  return {
    body,
    contentType,
    filename: asset.fileName ?? `chattea-${Date.now()}.jpg`,
  };
}
