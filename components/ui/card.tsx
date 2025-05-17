import * as React from "react"
import { View, StyleSheet } from "react-native"
import { ViewProps } from "react-native-web";


const Card = React.forwardRef<View, ViewProps>((props, ref) => {
  const { style, ...otherProps } = props;
  return (
    <View
      ref={ref}
      style={[styles.card, style]}
      {...otherProps}
    />
  );
});

const CardHeader = React.forwardRef<View, ViewProps>((props, ref) => {
  const { style, ...otherProps } = props;
  return (
    <View
      ref={ref}
      style={[styles.cardHeader, style]}
      {...otherProps}
    />
  );
});

const CardTitle = React.forwardRef<View, ViewProps>((props, ref) => {
  const { style, ...otherProps } = props;
  return (
    <View
      ref={ref}
      style={[styles.cardTitle, style]}
      {...otherProps}
    />
  );
});

const CardDescription = React.forwardRef<View, ViewProps>((props, ref) => {
  const { style, ...otherProps } = props;
  return (
    <View
      ref={ref}
      style={[styles.cardDescription, style]}
      {...otherProps}
    />
  );
});

const CardContent = React.forwardRef<View, ViewProps>((props, ref) => {
  const { style, ...otherProps } = props;
  return (
    <View
      ref={ref}
      style={[styles.cardContent, style]}
      {...otherProps}
    />
  );
});

const CardFooter = React.forwardRef<View, ViewProps>((props, ref) => {
  const { style, ...otherProps } = props;
  return (
    <View
      ref={ref}
      style={[styles.cardFooter, style]}
      {...otherProps}
    />
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', // bg-card
    borderWidth: 1, // border
    borderRadius: 12, // rounded-xl
    borderColor: '#e5e7eb', // default border color
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3, // shadow

  },
  cardHeader: {
    flexDirection: 'column', // flex flex-col
    gap: 6, // space-y-1.5
    padding: 24, // p-6
  },
  cardTitle: {
    fontFamily: 'System', // default system font
    fontWeight: '600', // font-semibold
    lineHeight: 1, // leading-none
    letterSpacing: -0.5, // tracking-tight
  },
  cardDescription: {
    fontSize: 14, // text-sm
    color: '#6b7280', // text-muted-foreground
  },
  cardContent: {
    padding: 24, // p-6
    paddingTop: 0, // pt-0
  },
  cardFooter: {
    flexDirection: 'row', // flex
    alignItems: 'center', // items-center
    padding: 24, // p-6
    paddingTop: 0, // pt-0
  },
});

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
}