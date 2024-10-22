import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ToastAndroid,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { AntDesign } from "@expo/vector-icons"; // Ensure you have installed @expo/vector-icons
import { Rating } from "react-native-ratings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/AntDesign";

function FaveriteScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleProductClick = (product) => {
    console.log("navigate to detail product", product.id);
    navigation.navigate("Home", {
      screen: "Detail Product",
      params: { productTypeId: product.id },
    });
  };

  const fetchFavorites = async () => {
    const favorites = await AsyncStorage.getItem("favorites");
    if (favorites) {
      setFavorites(JSON.parse(favorites));
    }
  };

  useEffect(() => {
    const filterFavorites = () => {
      if (search) {
        const filtered = favorites.filter((product) =>
          product.artName.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(favorites);
      }
    };

    filterFavorites();
  }, [search, favorites]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const handleRemoveFavorite = (item) => {
    // Show an alert to confirm removal
    Alert.alert(
      "Remove Favorite", // Title of the alert
      `Are you sure you want to remove ${item.artName} from your favorites?`, // Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel", // Styling for the Cancel button
        },
        {
          text: "Remove",
          onPress: async () => {
            // Proceed to remove the item from favorites
            let favoritesList = favorites.filter((favItem) => favItem.id !== item.id);
            await AsyncStorage.setItem("favorites", JSON.stringify(favoritesList));
            setFavorites(favoritesList);
            ToastAndroid.show("Removed product from favorite", ToastAndroid.SHORT);
          },
          style: "destructive", // Optionally add a 'destructive' style to indicate a critical action
        },
      ],
      { cancelable: true } // Allow the user to dismiss the alert by tapping outside of it
    );
  };

  const handleRemoveAllFavorites = () => {
    // Show an alert to confirm removing all favorites
    if(favorites.length === 0) return;
    Alert.alert(
      "Remove All Favorites", // Title of the alert
      "Are you sure you want to remove all items from your favorites?", // Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel", // Cancel button
        },
        {
          text: "Remove All",
          onPress: async () => {
            // Proceed to remove all favorites
            await AsyncStorage.removeItem("favorites");
            setFavorites([]); // Clear the favorites state
            setFilteredProducts([]); // Also clear filtered products if needed
            ToastAndroid.show("All favorites removed", ToastAndroid.SHORT);
          },
          style: "destructive", // Destructive style to indicate a critical action
        },
      ],
      { cancelable: true } // Allow dismissing the alert by tapping outside of it
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
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

    return (
      <TouchableOpacity
        onPress={() => handleProductClick(item)}
        className="w-[160px] h-[250px] m-[15px] flex flex-col"
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
        </View>
        <View
          style={{
            width: "100%",
            height: "40%",
            paddingVertical: 5,
            paddingHorizontal: 10,
            backgroundColor: "white",
          }}
          className="shadow-inner"
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
            <TouchableOpacity onPress={() => handleRemoveFavorite(item)}>
              <AntDesign name="delete" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className="flex flex-row justify-between px-3 overflow-hidden py-2">
      <Text className="text-xl font-bold">You have {favorites.length} item</Text>
      <TouchableOpacity onPress={handleRemoveAllFavorites}>
        <Text className="text-lg text-red-500">Remove all</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 300 }}>
      <Text className="font-bold text-2xl">No items added to list yet.</Text>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Search bar */}
      <View className="flex-row justify-between items-center px-3 pb-2 pt-4">
        <View className="flex-row items-center px-2 border border-gray-300 rounded-md w-full bg-white mb-2 shadow">
          <TextInput
            placeholder="Search something..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 p-1 h-[45px]"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Icon name="closecircle" size={20} className="ml-1" />
            </TouchableOpacity>
          ) : (
            <Icon name="search1" size={20} className="ml-1" />
          )}
        </View>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString()}
        numColumns={2}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={true}
        bounces={true}
        initialNumToRender={10}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

export default FaveriteScreen;