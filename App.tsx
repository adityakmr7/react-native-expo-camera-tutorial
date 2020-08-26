import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Permissions from "expo-permissions";
import React, { useEffect, useReducer, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import IconButton from "./src/components";
const { width: wWidth, height: wHeight } = Dimensions.get("window");

const whiteBlcProps = [
  { id: "auto", property: "Auto" },
  { id: "sunny", property: "Sunny" },
  { id: "cloudy", property: "Cloudy" },
  { id: "shadow", property: "Shadow" },
  { id: "incandescent", property: "Incandescent" },
  { id: "fluorescent", property: "Fluorescent" },
];

const initialState = {
  whbalance: Camera.Constants.WhiteBalance.auto,
};
function reducer(state: {}, action: { type: string }) {
  switch (action.type) {
    case "auto":
      return { ...state, whbalance: Camera.Constants.WhiteBalance.auto };
    case "sunny":
      return { ...state, whbalance: Camera.Constants.WhiteBalance.sunny };
    case "cloudy":
      return { ...state, whbalance: Camera.Constants.WhiteBalance.cloudy };
    case "shadow":
      return { ...state, whbalance: Camera.Constants.WhiteBalance.shadow };
    case "incandescent":
      return {
        ...state,
        whbalance: Camera.Constants.WhiteBalance.incandescent,
      };
    case "fluorescent":
      return { ...state, whbalance: Camera.Constants.WhiteBalance.fluorescent };
    default:
      return { ...state, whbalance: Camera.Constants.WhiteBalance.auto };
  }
}

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);

  // Use Reducer
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const _handleCameraToggle = () => {
    if (type === Camera.Constants.Type.back) {
      setType(Camera.Constants.Type.front);
    } else {
      setType(Camera.Constants.Type.back);
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
    if (value === "auto") {
      dispatch({ type: "auto" });
    } else if (value === "sunny") {
      dispatch({ type: "sunny" });
    } else if (value === "cloudy") {
      dispatch({
        type: "cloudy",
      });
    } else if (value === "shadow") {
      dispatch({
        type: "shadow",
      });
    } else if (value === "incandescent") {
      dispatch({
        type: "incandescent",
      });
    } else if (value === "fluorescent") {
      dispatch({
        type: "fluorescent",
      });
    }
  };

  console.log(cam.current);
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <Camera
        whiteBalance={state.whbalance}
        flashMode={flash}
        ref={cam}
        style={{ flex: 1 }}
        type={type}
      >
        <View
          style={{
            backgroundColor: "black",
            width: wWidth,
            height: wHeight * 0.1,
          }}
        >
          <View style={{ padding: 20 }}>
            <ScrollView>
              <IconButton
                icon={
                  flash === Camera.Constants.FlashMode.on ? "zap" : "zap-off"
                }
                onPress={_toggleFlash}
              />
            </ScrollView>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            backgroundColor: "black",
            width: wWidth,
            opacity: 0.5,
            height: wHeight * 0.2,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              width: wWidth,
            }}
          >
            <View
              style={{
                width: wWidth,
                alignItems: "center",
              }}
            >
              <ScrollView horizontal={true}>
                {whiteBlcProps.map((wb, _) => {
                  return (
                    <TouchableWithoutFeedback
                      onPress={() => _handleWhiteBalance(wb.id)}
                      key={wb.id}
                    >
                      <View style={{ padding: 10 }}>
                        <Text style={{ color: "white" }}>{wb.property}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </ScrollView>
            </View>
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <IconButton icon="refresh-cw" onPress={_handleCameraToggle} />
              <IconButton icon="camera" size={50} onPress={_takePicture} />
              <IconButton icon="grid" onPress={() => true} />
            </View>
          </View>
        </View>
      </Camera>
    </View>
  );
}
