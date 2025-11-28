import React from 'react';
import { ViewStyle } from 'react-native';
import {
  SafeAreaView as RNSafeAreaView,
  Edge,
} from 'react-native-safe-area-context';

export interface SafeAreaViewProps {
  /**
   * Children components to render inside SafeAreaView
   */
  children: React.ReactNode;
  /**
   * Custom style for the container
   */
  style?: ViewStyle | ViewStyle[];
  /**
   * Edges to apply safe area insets to
   * If not provided, applies to all edges (top, bottom, left, right)
   * @default undefined (all edges)
   */
  edges?: Edge[];
  /**
   * Background color for the SafeAreaView
   */
  backgroundColor?: string;
}

/**
 * Reusable SafeAreaView component that wraps react-native-safe-area-context
 * Provides consistent safe area handling throughout the app
 */
export const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  style,
  edges,
  backgroundColor,
  ...props
}) => {
  const containerStyle: ViewStyle[] = [];

  if (Array.isArray(style)) {
    containerStyle.push(...style);
  } else if (style) {
    containerStyle.push(style);
  }

  if (backgroundColor) {
    containerStyle.push({ backgroundColor });
  }

  return (
    <RNSafeAreaView
      style={containerStyle.length > 0 ? containerStyle : undefined}
      edges={edges}
      {...props}
    >
      {children}
    </RNSafeAreaView>
  );
};
