import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import axios from "axios";
import CategoryCart from "../components/CategoryCart";
import ProductCard from "../components/ProductCard";
import Icon from "react-native-vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";

function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numColumns, setNumColumns] = useState(2);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts().then(() => setRefreshing(false));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        // "https://663b458ffee6744a6ea103a0.mockapi.io/product"
        "https://670daddb073307b4ee44281a.mockapi.io/api/v1/tool"
      );
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );


  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = selectedCategory
        ? product.brand === selectedCategory
        : true;
      const matchesSearch = search
        ? product.artName.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  const handleSelectCategory = (brand) => {
    setSelectedCategory(brand);
  };

  const getUniqueBrands = (products) => {
    const brands = products.map((product) => product.brand);
    return [...new Set(brands)];
  };

  const uniqueBrands = getUniqueBrands(products);

  // const data = [
  //   { id: "1", source: require("../assets/Group 354.png") },
  //   { id: "2", source: require("../assets/Group 354.png") },
  //   { id: "3", source: require("../assets/Group 354.png") },
  // ];

  const renderCategoryItem = ({ item: brand }) => (
    <TouchableOpacity onPress={() => handleSelectCategory(brand)}>
      <CategoryCart title={brand} selected={selectedCategory === brand} />
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => <ProductCard item={item} />;

  const ListHeaderComponent = () => (
    <>
      {/* Category */}
      <View className="flex flex-row justify-between px-3 overflow-hidden">
        <Text className="text-xl font-bold">Categories</Text>
        <TouchableOpacity onPress={() => handleSelectCategory("")}>
          <Text className="text-lg text-blue-400">See all</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-2 flex flex-row justify-center">
        <FlatList
          data={uniqueBrands}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCategoryItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "center",
          }}
        />
      </View>
    </>
  );

  //loading spinner
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

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

      {/* Product list */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={renderProductItem}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center pt-32 space-y-4">
              <Text className="text-lg">No product found</Text>
              <View className="flex-1 justify-center items-center pt-32"></View>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
  );
}

export default HomeScreen;
