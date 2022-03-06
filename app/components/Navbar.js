import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text } from "react-native";

//Screen names
const readName = "Прочитать";
const recognizeName = "Распознать";
const findName = "Найти";
const settingsName = "Настройки";

const Tab = createBottomTabNavigator();



function NavigationBar() {
    let counter = 0;
    let Empty = () => {
        counter ++;
        return (
            <View>
                <Text>hi {counter}</Text>
            </View>
        )
    };
    return (
        <NavigationContainer>
        <Tab.Navigator
            initialRouteName={readName}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let rn = route.name;

                    if (rn === readName) {
                        iconName = focused ? "book" : "book-outline";
                    } else if (rn === recognizeName) {
                        iconName = focused ? "eye" : "eye-outline";
                    } else if (rn === findName) {
                        iconName = focused ? "search" : "search-outline";
                    } else if (rn === settingsName) {
                        iconName = focused ? "settings" : "settings-outline";
                    }

                    // You can return any component that you like here!
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
            tabBarOptions={{
                activeTintColor: "darkviolet",
                inactiveTintColor: "grey",
                labelStyle: { paddingBottom: 10, fontSize: 10 },
                style: { padding: 10, height: 70 },
            }}
            
        >
            <Tab.Screen name={readName} component={Empty} />
            <Tab.Screen name={recognizeName} component={Empty} />
            <Tab.Screen name={findName} component={Empty} />
            <Tab.Screen name={settingsName} component={Empty} />
        </Tab.Navigator>
        </NavigationContainer>
  );
}

export default NavigationBar;
