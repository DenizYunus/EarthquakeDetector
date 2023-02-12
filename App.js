import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';

export default function App() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [subscription, setSubscription] = useState(null);
  const [mode, setMode] = useState("Idle");
  const [xBroken, setXBroken] = useState("false");
  const [yBroken, setYBroken] = useState("false");
  const [zBroken, setZBroken] = useState("false");

  const [minX, setMinX] = useState(-9999);
  const [maxX, setMaxX] = useState(-9999);
  const [minY, setMinY] = useState(-9999);
  const [maxY, setMaxY] = useState(-9999);
  const [minZ, setMinZ] = useState(-9999);
  const [maxZ, setMaxZ] = useState(-9999);

  const [buttonColor, setButtonColor] = useState("yellow");
  const [buttonText, setButtonText] = useState("START");

  const [locationText, setLocationText] = useState("");

  var calibrationTimer = useRef(null);
  const calibrationDelay = 10000;

  const earthquakeTimer = useRef(null);
  const earthquakeDelay = 4000;

  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(600);

  const earthquakeStuff = ({ x, y, z }) => {
    // console.log(mode);

    if (mode == "Calibration") {
      if (minX === -9999) {
        setMinX(x);
      }
      else if (x < minX) {
        setMinX(x);
        console.log(minX);
        resetCalibrationTimer();
      }
      if (maxX === -9999) {
        setMaxX(x);
      }
      else if (x > maxX) {
        setMaxX(x);
        console.log(maxX);
        resetCalibrationTimer();
      }
      if (minY === -9999) {
        setMinY(y);
      }
      else if (y < minY) {
        setMinY(y);
        console.log(minY);
        resetCalibrationTimer();
      }
      if (maxY === -9999) {
        setMaxY(y);
      }
      else if (y > maxY) {
        setMaxY(y);
        console.log(maxY);
        resetCalibrationTimer();
      }
      if (minZ === -9999) {
        setMinZ(z);
      }
      else if (z < minZ) {
        setMinZ(z);
        console.log(minZ);
        resetCalibrationTimer();
      }
      if (maxZ === -9999) {
        setMaxZ(z);
      }
      else if (z > maxZ) {
        setMaxZ(z);
        console.log(maxZ);
        resetCalibrationTimer();
      }
    }
    else if (mode == "Checking") {
      if (x < minX - 0.02 || x > maxX + 0.02) setXBroken("true");
      else setXBroken("false");
      if (y < minY - 0.02 || y > maxY + 0.02) setYBroken("true");
      else setYBroken("false");
      if (z < minZ - 0.02 || z > maxZ + 0.02) setZBroken("true");
      else setZBroken("false");
      if (xBroken == "true" || yBroken == "true" || zBroken == "true") {
        setButtonText("NOT SAFE :(");
        setButtonColor("red");

        if (!earthquakeTimer.current) {
          earthquakeTimer.current = setTimeout(() => {
            earthquakeHappening();
            clearTimeout(earthquakeTimer.current);
            earthquakeTimer.current = null;
          }, earthquakeDelay);
        }

      } else {
        setButtonText("SAFE :)");
        setButtonColor("green");
        clearTimeout(earthquakeTimer.current);
        earthquakeTimer.current = null;
      }
    }
  }

  useEffect(() => { //LOCATION USEEFFECT

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();
  }, []);

  const setCheckingMode = () => {
    setMode("Checking");
    setButtonColor("green");
    setButtonText("SAFE :)");
  }

  const resetCalibrationTimer = () => {
    clearTimeout(calibrationTimer.current);
    calibrationTimer.current = setTimeout(() => {
      setCheckingMode();
    }, calibrationDelay);
  }

  async function earthquakeHappening() {
    let location = await Location.getCurrentPositionAsync({});
    if (errorMsg) {
      setLocationText(errorMsg);
    } else if (location.coords.latitude !== "undefined") {
      setLocation(location);
      console.log("Earthquake Happened : Lat: " + location.coords.latitude + " Long: " + location.coords.longitude);
      setLocationText("Lat: " + location.coords.latitude + "\n" + "Long: " + location.coords.longitude);
    }
  }


  const _subscribe = () => {
    setSubscription([
      Accelerometer.addListener(setData),
      Accelerometer.addListener(earthquakeStuff),
      _fast()]
    );
  };

  const _unsubscribe = () => {
    subscription && Object.keys(subscription).forEach(key => { if (typeof subscription[key] == "object") subscription[key].remove() });
    setSubscription(null);
  };

  useEffect(() => { // ACCELEROMETER USEEFFECT
    _unsubscribe();
    _subscribe();
    return () => _unsubscribe();
  }, [mode, minX, maxX, minY, maxY, minZ, maxZ, xBroken, yBroken, zBroken])

  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>*/}
      <Text style={{ fontSize: 25, marginBottom: "10%", textAlign: "center" }}>
        Location:{"\n"}{locationText}
      </Text>
      <Text style={{ fontSize: 25, marginBottom: "10%" }}>
        {mode == "Idle" && "Idle"}
        {mode == "Calibration" && 'Calibrating'}
        {mode == "Checking" && "Earthquake is" && ((xBroken == "true" || yBroken == "true" || zBroken == "true") == true ? "happening." : "not happening.")}
      </Text>

      <TouchableOpacity style={{ borderRadius: 100, width: "50%", height: "20%", backgroundColor: buttonColor, justifyContent: "center", alignItems: "center" }} onPress={() => {
        setMode("Calibration");
        setButtonColor("blue");
        setButtonText("CALIBRATING")
        calibrationTimer.current = setTimeout(() => {
          setMode("Checking"); setButtonColor("yellow"); setButtonText("SAFE :)");
        }, calibrationDelay);
      }}>
        <Text style={{ color: "black", fontSize: 25, width: "100%", textAlign: "center" }}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
