import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons"; // Ensure you have installed @expo/vector-icons
import { Rating } from "react-native-ratings";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProductCard = ({ item }) => {
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);

  const oldPrice = item.price / (1 - item.limitedTimeDeal);
  const formattedOldPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(oldPrice);
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(item.price);

  const totalRating = item.comments.reduce(
    (acc, comment) => acc + comment.rating,
    0
  );
  const averageRating = (totalRating / item.comments.length).toFixed(1);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const favorites = await AsyncStorage.getItem("favorites");
      if (favorites) {
        const favoritesList = JSON.parse(favorites);
        setIsFavorite(favoritesList.some((favItem) => favItem.id === item.id));
      }
    };
    checkFavoriteStatus();
  }, [item.id]);

  const handleFavoritePress = async () => {
    const favorites = await AsyncStorage.getItem("favorites");
    let favoritesList = favorites ? JSON.parse(favorites) : [];
    if (isFavorite) {
      favoritesList = favoritesList.filter((favItem) => favItem.id !== item.id);
      await AsyncStorage.setItem("favorites", JSON.stringify(favoritesList));
      ToastAndroid.show("Removed product from favorite", ToastAndroid.SHORT);
    } else {
      favoritesList.push(item);
      await AsyncStorage.setItem("favorites", JSON.stringify(favoritesList));
      ToastAndroid.show("Added product to favorite", ToastAndroid.SHORT);
    }
    setIsFavorite(!isFavorite);
  };

  return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Detail Product", {
            productTypeId: item.id,
          })
        }
        style={{ boxShadow: "10px 10px rgba(0, 0, 0, 0.1)" }}
        className="w-[160px] h-[280px] m-[8px] flex flex-col rounded-md overflow-hidden"
      >
        <View style={{ position: "relative", width: "100%", height: "66%" }}>
          <Image
            source={{ uri: item.image }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 3,
              backgroundColor: "#E4E4E4",
            }}
            resizeMode="cover"
          />
          {item.limitedTimeDeal > 0 && (
            <View
              style={{
                position: "absolute",
                top: 5,
                left: 5,
                backgroundColor: "#e91e63",
                padding: 5,
                borderRadius: 3,
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                {item.limitedTimeDeal * 100}% OFF
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 5,
              right: 5,
            }}
            onPress={handleFavoritePress}
          >
            <AntDesign
              name="heart"
              size={24}
              color={isFavorite ? "red" : "black"}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: "100%",
            height: "40%",
            paddingVertical: 5,
            paddingHorizontal: 10,
            backgroundColor: "white",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Text
            style={{ fontWeight: "bold", fontSize: 16 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.artName}
          </Text>
          {item.limitedTimeDeal > 0 ? (
            <View className="flex flex-row items-center mt-1">
              <Text className="font-bold text-gray-500 line-through mr-2">
                {formattedOldPrice}
              </Text>
              <Text className="font-bold text-pink-500 text-[16px]">
                {formattedPrice}
              </Text>
            </View>
          ) : (
            <Text className="font-bold text-pink-500 mt-1 text-[16px]">
              {formattedPrice}
            </Text>
          )}
          <View className="flex flex-row items-center justify-between my-4">
            <View className="lex flex-row items-center">
              <Rating
                ratingCount={1}
                readonly={false}
                imageSize={15}
                startingValue={1}
              />
              <Text className="ml-1">{averageRating} Rating</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
  );
};

export default ProductCard;
