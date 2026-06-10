import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface HoldButtonProps {
  label: string;
  sublabel?: string;
  holdDuration?: number;
  onComplete: () => void;
  disabled?: boolean;
  size?: "normal" | "large";
}

export function HoldButton({
  label,
  sublabel,
  holdDuration = 3000,
  onComplete,
  disabled = false,
  size = "normal",
}: HoldButtonProps) {
  const colors = useColors();
  const [isHolding, setIsHolding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const completedRef = useRef(false);

  const diameter = size === "large" ? 180 : 140;
  const strokeWidth = size === "large" ? 6 : 5;
  const innerDiameter = diameter - strokeWidth * 2;

  const circumference = Math.PI * (diameter - strokeWidth);

  const startHold = useCallback(() => {
    if (disabled || completedRef.current) return;
    setIsHolding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.94,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();

    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: holdDuration,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
        }).start();
        onComplete();
        setTimeout(() => {
          completedRef.current = false;
          setCompleted(false);
          progress.setValue(0);
        }, 1500);
      }
    });
  }, [disabled, holdDuration, onComplete, progress, scale]);

  const stopHold = useCallback(() => {
    if (completedRef.current) return;
    setIsHolding(false);
    animRef.current?.stop();
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.timing(progress, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [progress, scale]);

  useEffect(() => {
    return () => {
      animRef.current?.stop();
    };
  }, []);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const ringColor = completed
    ? colors.success
    : isHolding
    ? colors.teal
    : disabled
    ? colors.mutedForeground
    : colors.teal;

  return (
    <TouchableWithoutFeedback
      onPressIn={startHold}
      onPressOut={stopHold}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.container,
          { width: diameter, height: diameter, transform: [{ scale }] },
        ]}
      >
        {/* Outer ring SVG-like with border */}
        <View
          style={[
            styles.outerRing,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              borderColor: disabled ? colors.border : ringColor,
              borderWidth: strokeWidth,
              opacity: disabled ? 0.4 : 1,
            },
          ]}
        />

        {/* Progress arc overlay */}
        {isHolding && (
          <Animated.View
            style={[
              styles.progressRing,
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                borderWidth: strokeWidth,
                borderColor: colors.teal,
                opacity: 0.3,
              },
            ]}
          />
        )}

        {/* Inner circle */}
        <View
          style={[
            styles.innerCircle,
            {
              width: innerDiameter,
              height: innerDiameter,
              borderRadius: innerDiameter / 2,
              backgroundColor: completed
                ? colors.success
                : isHolding
                ? colors.tealDark
                : disabled
                ? colors.muted
                : colors.navy,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: disabled ? colors.mutedForeground : colors.primary,
                fontSize: size === "large" ? 15 : 13,
              },
            ]}
          >
            {completed ? "OPENED" : label}
          </Text>
          {sublabel && !completed && (
            <Text
              style={[
                styles.sublabel,
                {
                  color: disabled ? colors.mutedForeground : colors.mutedForeground,
                  fontSize: size === "large" ? 11 : 10,
                },
              ]}
            >
              {sublabel}
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  outerRing: {
    position: "absolute",
  },
  progressRing: {
    position: "absolute",
  },
  innerCircle: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  sublabel: {
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
    textAlign: "center",
    opacity: 0.7,
  },
});
