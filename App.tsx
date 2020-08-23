import { Feather as Icon } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Permissions from "expo-permissions";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { width: wWidth, height: wHeight } = Dimensions.get("window");

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const cam = useRef<Camera | null>();

  const _takePicture = async () => {
    if (cam.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      let photo = await cam.current.takePictureAsync(options);

      console.log(cam.current.getSupportedRatiosAsync());
      const source = photo.uri;

      if (source) {
        handleSave(source);
      }
    }
  };

  const handleSave = async (photo: string) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      const assert = await MediaLibrary.createAssetAsync(photo);
      await MediaLibrary.createAlbumAsync("Tutorial", assert);
    } else {
      console.log("Oh You Missed to give permission");
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const styles = StyleSheet.create({
    cameraBox: {
      flex: 1,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <Camera ref={cam} style={styles.cameraBox} type={type}>
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              backgroundColor: "black",
              height: wHeight * 0.1,
              width: wWidth,
            }}
          >
            {/* TODO:  Add function Icons Here */}
          </View>
          <View
            style={{
              opacity: 0.5,
              backgroundColor: "black",
              height: wHeight * 0.2,
              width: wWidth,
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: 300,
              }}
            >
              <View>
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      setType(
                        type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back
                      );
                    }}
                  >
                    <Icon name="refresh-cw" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <TouchableOpacity onPress={() => _takePicture()}>
                  <Icon name="aperture" size={50} color="white" />
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={() => _takePicture()}>
                  <Icon name="grid" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Camera>
    </View>
  );
}
