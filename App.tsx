import Slider from "@react-native-community/slider";
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
  whbalance: "auto",
  cameraType: "back",
  flash: "off",
  zoomValue: 0,
};
function reducer(state = initialState, action: { type: string; payload: any }) {
  switch (action.type) {
    case "@type/WH_BALANCE":
      return { ...state, whbalance: action.payload };
    case "@type/CAMERA_BACK":
      return { ...state, cameraType: action.payload };
    case "@type/CAMERA_FRONT":
      return { ...state, cameraType: action.payload };
    case "@type/FLASH":
      return { ...state, flash: action.payload };
    case "@type/ZOOM":
      return {
        ...state,
        zoomValue: action.payload,
      };
    default:
      return { ...state };
  }
}

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  // Use Reducer
  const [state, dispatch] = useReducer(reducer, initialState);
  const { cameraType, whbalance, flash, zoomValue } = state;

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
    if (cameraType === "back") {
      dispatch({
        type: "@type/CAMERA_FRONT",
        payload: "front",
      });
    } else {
      dispatch({
        type: "@type/CAMERA_BACK",
        payload: "back",
      });
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
    if (flash === "off") {
      dispatch({
        type: "@type/FLASH",
        payload: "on",
      });
    } else {
      dispatch({
        type: "@type/FLASH",
        payload: "off",
      });
    }
  };

  const _zoomEffect = (value: number) => {
    dispatch({
      type: "@type/ZOOM",
      payload: value,
    });
  };

  const _handleWhiteBalance = (value: string) => {
    if (value.length > 0) {
      dispatch({
        type: "@type/WH_BALANCE",
        payload: value,
      });
    }
  };

  //console.log(cam.current);
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <Camera
        zoom={zoomValue}
        whiteBalance={whbalance}
        flashMode={flash}
        ref={cam}
        style={{ flex: 1 }}
        type={cameraType}
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
                icon={flash === "on" ? "zap" : "zap-off"}
                onPress={_toggleFlash}
              />
            </ScrollView>
          </View>
        </View>
        <View
          style={{
            position: "relative",
            top: 450,
            width: wWidth,
          }}
        >
          <Slider
            onValueChange={_zoomEffect}
            style={{
              width: 300,
              height: 80,
            }}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
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
