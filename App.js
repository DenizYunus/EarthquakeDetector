import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
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

  var calibrationTimer = useRef(null);
  const calibrationDelay = 10000;


  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(600);
  // const _fast = () => Accelerometer.setUpdateInterval(16);

  const earthquakeStuff = ({ x, y, z }) => {
    console.log(mode);
    // console.log("Earthquake is ", ((xBroken || yBroken || zBroken) == true ? "happening." : "not happening."), xBroken, yBroken, zBroken)
    // console.log(typeof maxX, x, maxX)
    // console.log(x, minX, z < minX)
    // console.log(x, maxX, z > maxX)
    // console.log(y, minY, z < minY)
    // console.log(y, maxY, z > maxY)
    // console.log(z, minZ, z < minZ)
    // console.log(z, maxZ, z > maxZ)

    if (mode == "Calibration") {
      if (minX === -9999) {
        setMinX(x);
      }
      else if (x < minX) {
        setMinX(x);
        console.log(minX);
        clearTimeout(calibrationTimer.current);
        calibrationTimer.current = setTimeout(() => {
          setMode("Checking"); setButtonColor("green"); setButtonText("SAFE :)");
        }, calibrationDelay);
      }
      if (maxX === -9999) {
        setMaxX(x);
      }
      else if (x > maxX) {
        setMaxX(x);
        console.log(maxX);
        clearTimeout(calibrationTimer.current);
        calibrationTimer.current = setTimeout(() => {
          setMode("Checking"); setButtonColor("green"); setButtonText("SAFE :)");
        }, calibrationDelay);
      }
      if (minY === -9999) {
        setMinY(y);
      }
      else if (y < minY) {
        setMinY(y);
        console.log(minY);
        clearTimeout(calibrationTimer.current);
        calibrationTimer.current = setTimeout(() => {
          setMode("Checking"); setButtonColor("green"); setButtonText("SAFE :)");
        }, calibrationDelay);
      }
      if (maxY === -9999) {
        setMaxY(y);
      }
      else if (y > maxY) {
        setMaxY(y);
        console.log(maxY);
        clearTimeout(calibrationTimer.current);
        calibrationTimer.current = setTimeout(() => {
          setMode("Checking"); setButtonColor("green"); setButtonText("SAFE :)");
        }, calibrationDelay);
      }
      if (minZ === -9999) {
        setMinZ(z);
      }
      else if (z < minZ) {
        setMinZ(z);
        console.log(minZ);
        clearTimeout(calibrationTimer.current);
        calibrationTimer.current = setTimeout(() => {
          setMode("Checking"); setButtonColor("green"); setButtonText("SAFE :)");
        }, calibrationDelay);
      }
      if (maxZ === -9999) {
        setMaxZ(z);
      }
      else if (z > maxZ) {
        setMaxZ(z);
        console.log(maxZ);
        clearTimeout(calibrationTimer.current);
        calibrationTimer.current = setTimeout(() => {
          setMode("Checking"); setButtonColor("green"); setButtonText("SAFE :)");
        }, calibrationDelay);
      }
    }
    else if (mode == "Checking") {
      if (x < minX || x > maxX) setXBroken("true");
      else setXBroken("false");
      if (y < minY || y > maxY) setYBroken("true");
      else setYBroken("false");
      if (z < minZ || z > maxZ) setZBroken("true");
      else setZBroken("false");
      if (xBroken == "true" || yBroken == "true" || zBroken == "true") {
        setButtonText("NOT SAFE :(");
        setButtonColor("red");
      } else {
        setButtonText("SAFE :)");
        setButtonColor("green");
      }
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

  useEffect(() => {
    _unsubscribe();
    _subscribe();
    return () => _unsubscribe();
  }, [mode, minX, maxX, minY, maxY, minZ, maxZ, xBroken, yBroken, zBroken])

  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>*/}
      <Text style={{ fontSize: 25, marginBottom: "10%" }}>
        {mode == "Idle" && "Idle"}
        {mode == "Calibration" && 'Calibrating'}
        {mode == "Checking" && "Earthquake is" && ((xBroken == "true" || yBroken == "true" || zBroken == "true") == true ? "happening." : "not happening.")}
      </Text>
      {/* <Text style={styles.text}>{xBroken} x: {x}</Text>
      <Text style={styles.text}>minX: {minX}, maxX: {maxX}</Text>
      <Text style={styles.text}>{yBroken} y: {y}</Text>
      <Text style={styles.text}>minY: {minY}, maxY: {maxY}</Text>
      <Text style={styles.text}>{zBroken} z: {z}</Text>
      <Text style={styles.text}>minZ: {minZ}, maxZ: {maxZ}</Text> */}
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
      {/* <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode("Calibration")} style={[styles.button, styles.middleButton]}>
          <Text>Start Calibration</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode("Checking")} style={styles.button}>
          <Text>Start Listening for Earthquake</Text>
        </TouchableOpacity>
      </View> */}
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
