import axios from "axios";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  RefreshControl,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Rating } from "react-native-ratings";
import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment"; // For date formatting
import { useFocusEffect } from "@react-navigation/native";

function DetailScreen({ route, navigation }) {
  const { productTypeId } = route.params || {};
  const [productDetail, setProductDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://670daddb073307b4ee44281a.mockapi.io/api/v1/tool/${productTypeId}`
      );
      setProductDetail(response.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const favorites = await AsyncStorage.getItem("favorites");
    if (favorites) {
      const favoritesList = JSON.parse(favorites);
      setIsFavorite(
        favoritesList.some((favItem) => favItem.id === productDetail.id)
      );
    }
  };

  useEffect(() => {
    checkFavoriteStatus();
  }, [productDetail.id, isFavorite]);

  useFocusEffect(
    useCallback(() => {
      checkFavoriteStatus();
    }, [productDetail.id, isFavorite])
  );

  const handleFavoritePress = async () => {
    const favorites = await AsyncStorage.getItem("favorites");
    let favoritesList = favorites ? JSON.parse(favorites) : [];
    if (isFavorite) {
      favoritesList = favoritesList.filter(
        (favItem) => favItem.id !== productDetail.id
      );
      await AsyncStorage.setItem("favorites", JSON.stringify(favoritesList));
      ToastAndroid.show("Removed product from favorite", ToastAndroid.SHORT);
    } else {
      favoritesList.push(productDetail);
      await AsyncStorage.setItem("favorites", JSON.stringify(favoritesList));
      ToastAndroid.show("Added product to favorite", ToastAndroid.SHORT);
    }
    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    if (productTypeId) {
      fetchProductDetail();
    }
  }, [productTypeId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProductDetail();
    setRefreshing(false);
  };

  const oldPrice = productDetail.price / (1 - productDetail.limitedTimeDeal);

  const formattedOldPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(oldPrice);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(productDetail.price);

  const comments = Array.isArray(productDetail.comments)
    ? productDetail.comments
    : [];

  const totalRating = comments.reduce(
    (acc, comment) => acc + comment.rating,
    0
  );
  const averageRating = (totalRating / comments.length).toFixed(1);

  if (!productTypeId) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No product available</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  // Manually map through comments array
  const renderComments = () => {
    return comments.map((item) => (
      <View
        key={item.id}
        style={{
          marginBottom: 20,
          padding: 15,
          backgroundColor: "white",
          borderRadius: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.user}</Text>
          <Text style={{ color: "gray", fontSize: 12 }}>
            {moment(item.createdAt, "DD-MM-YYYY").format("DD/MM/YYYY")}
          </Text>
        </View>
        <Rating
          startingValue={item.rating}
          imageSize={20}
          readonly
          style={{ marginTop: 5 }}
          className="items-start"
        />
        <Text style={{ marginTop: 8, fontSize: 14, color: "#333" }}>
          {item.comment}
        </Text>
      </View>
    ));
  };

  return (
    <ScrollView
      className=""
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Image
        source={{ uri: productDetail.image }}
        style={{ resizeMode: "contain" }}
        className="w-full h-[300px] bg-white rounded-b-2xl "
      />
      <View className="mt-5 px-[25px] ">
        <View>
          <Text className="text-xl font-bold">{productDetail.artName}</Text>
          {productDetail.limitedTimeDeal > 0 ? (
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
            <View className="flex flex-row items-center">
              <Rating
                ratingCount={1}
                readonly={false}
                imageSize={15}
                startingValue={1}
                tintColor="#F3F4F6"
              />
              <Text className="ml-1">{averageRating}</Text>
              <Text className="ml-4">
                {productDetail.comments?.length ?? 0} Reviews
              </Text>
            </View>
            <View className="flex flex-row items-center space-x-2">
              <Text className="font-bold">Glass Surface:</Text>
              <Text className="">
                {productDetail.glassSurface ? "Yes" : "No"}
              </Text>
            </View>
          </View>

          {/* Product Description */}
          <View className="border-y-[1px] border-gray-300">
            <View className="flex flex-col py-4 space-y-2">
              <Text className="text-lg font-bold">Product Description</Text>
              <Text className="text-gray-500 mt-2">
                {productDetail.description}
              </Text>
            </View>
          </View>

          {/* Comments Section */}
          <View className="mt-4">
            <Text className="text-lg font-bold">Customer Comments</Text>
            {comments.length > 0 ? (
              <View>{renderComments()}</View>
            ) : (
              <Text className="text-gray-500 mt-2">No comments available.</Text>
            )}
          </View>

          {/* Add to favorite */}
          <View className="flex-1 justify-end py-2">
            <TouchableOpacity
              onPress={handleFavoritePress}
              className="flex flex-row justify-between items-center w-full h-[50px] px-4 bg-[#FE3A30] rounded-lg mt-6"
            >
              <Text className="font-bold text-lg text-white">
                {isFavorite ? "Added" : "Add to wish list"}
              </Text>
              <AntDesign name="heart" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default DetailScreen;
