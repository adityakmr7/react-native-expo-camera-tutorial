import { Feather as Icon } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Permissions from "expo-permissions";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
const { width: wWidth, height: wHeight } = Dimensions.get("window");

const whiteBlcProps = [
  { id: "auto", property: "Auto" },
  { id: "sunny", property: "Sunny" },
  { id: "cloudy", property: "Cloudy" },
  { id: "shadow", property: "Shadow" },
  { id: "incandescent", property: "Incandescent" },
  { id: "fluorescent", property: "Fluorescent" },
];

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [whBalance, setWhBalance] = useState<string>(
    Camera.Constants.WhiteBalance.auto
  );
  const cam = useRef<Camera | null>();

  const _takePicture = async () => {
    if (cam.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      let photo = await cam.current.takePictureAsync(options);

      //console.log(cam.current.getSupportedRatiosAsync());

      const source = photo.uri;
      cam.current.pausePreview();
      await handleSave(source);
      cam.current.resumePreview();
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

  const _toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const _handleWhiteBalance = (value: string) => {
    switch (value) {
      case value === "auto":
        return {
          setWhBalance(Camera.Constants.WhiteBalance.auto)
        }
      case value === "sunny":
        setWhBalance(Camera.Constants.WhiteBalance.sunny);
      case value === "cloudy":
        setWhBalance(Camera.Constants.WhiteBalance.cloudy);
      case value === "shadow":
        setWhBalance(Camera.Constants.WhiteBalance.shadow);
      case value === "incandescent":
        setWhBalance(Camera.Constants.WhiteBalance.incandescent);
      case value === "fluorescent":
        setWhBalance(Camera.Constants.WhiteBalance.fluorescent);
      default:
        setWhBalance(Camera.Constants.WhiteBalance.auto);
    }
  };
  const styles = StyleSheet.create({
    cameraBox: {
      flex: 1,
    },
    camContainer: {
      flex: 1,
      backgroundColor: "transparent",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    camHeader: {
      backgroundColor: "black",
      height: wHeight * 0.1 - 10,
      width: wWidth,
      padding: 20,
      justifyContent: "center",
    },
    camBottom: {
      opacity: 0.5,
      backgroundColor: "black",
      height: wHeight * 0.2,
      width: wWidth,
      flexDirection: "column",
      justifyContent: "center",
    },
    camBottomInside: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: wWidth * 0.8,
      alignItems: "center",
    },
  });
  console.log(whBalance);
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <Camera
        whiteBalance={whBalance}
        flashMode={flash}
        ref={cam}
        style={styles.cameraBox}
        type={type}
      >
        <View style={styles.camContainer}>
          <View style={styles.camHeader}>
            <ScrollView>
              <View>
                <TouchableOpacity onPress={() => _toggleFlash()}>
                  <Icon
                    name={
                      flash === Camera.Constants.FlashMode.on
                        ? "zap"
                        : "zap-off"
                    }
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          <View style={styles.camBottom}>
            <View
              style={{
                paddingVertical: 25,
                justifyContent: "center",
              }}
            >
              <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal={true}
              >
                {whiteBlcProps.map((item, _) => {
                  return (
                    <TouchableWithoutFeedback
                      key={item.id}
                      onPress={() => _handleWhiteBalance(item.id)}
                    >
                      <View style={{ padding: 10 }}>
                        <Text style={{ color: "white", fontSize: 20 }}>
                          {item.property}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </ScrollView>
            </View>
            <View style={styles.camBottomInside}>
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
