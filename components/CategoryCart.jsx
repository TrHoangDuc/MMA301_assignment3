import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const CategoryCart = ({ title, image, selected }) => {
  return (
    <View className={`flex justify-between border ${selected ? 'bg-gray-400' : 'bg-white'} border-gray-500 rounded-lg p-2 m-1 w-30 h-10 mx-3`}>
    <Text className="text-center truncate">{title}</Text>
  </View>
  );
};

export default CategoryCart;
